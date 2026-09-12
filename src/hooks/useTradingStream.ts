import { useEffect, useRef, useState } from "react";
import { websocketURL } from "@/lib/api";
import type { TradingSnapshot } from "@/lib/api-types";

export type StreamStatus = "connecting" | "open" | "closed";

interface StreamResult {
  snapshot: TradingSnapshot | null;
  status: StreamStatus;
  /** True once a socket has delivered at least one frame. */
  live: boolean;
}

/** Reconnect backoff, capped so a long outage does not stall reconnection. */
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

/**
 * Subscribes to /ws/trading for pushed engine, paper, guard and executor state.
 *
 * This replaces polling four endpoints on a timer. Panels should treat it as an
 * accelerator, not a replacement for their queries: if the socket is down the
 * existing polling still renders the page, so a websocket problem degrades
 * refresh rate rather than blanking the dashboard.
 */
export function useTradingStream(enabled = true): StreamResult {
  const [snapshot, setSnapshot] = useState<TradingSnapshot | null>(null);
  const [status, setStatus] = useState<StreamStatus>("closed");

  // Kept in refs so reconnect scheduling never re-triggers the effect.
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const closedByUs = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    closedByUs.current = false;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const connect = () => {
      setStatus("connecting");

      let ws: WebSocket;
      try {
        ws = new WebSocket(websocketURL("/ws/trading"));
      } catch {
        // Construction throws on a malformed URL; retry rather than crash.
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        setStatus("open");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as TradingSnapshot;
          if (parsed?.type === "trading") {
            setSnapshot(parsed);
          }
        } catch {
          // A malformed frame is not worth tearing the connection down for.
        }
      };

      ws.onerror = () => {
        // onclose always follows, so reconnection is handled there only.
      };

      ws.onclose = () => {
        setStatus("closed");
        if (!closedByUs.current) scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      clearTimer();
      const attempt = attemptRef.current++;
      const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
      timerRef.current = setTimeout(connect, delay);
    };

    connect();

    return () => {
      closedByUs.current = true;
      clearTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]);

  return { snapshot, status, live: snapshot !== null && status === "open" };
}
