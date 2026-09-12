import React from "react";
import { AlertCircle, Loader2, PowerOff, RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api";

interface Props {
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  children: React.ReactNode;
  /** Shown when the backend reports the feature is switched off (503). */
  disabledTitle?: string;
  disabledHint?: string;
}

/**
 * Wraps a panel with consistent loading, error and feature-disabled states.
 *
 * The three cases are kept distinct on purpose: "the engine is off" is a
 * normal configuration state, not a failure, and showing it as an error would
 * send people hunting for a bug that is not there.
 */
export function ApiState({
  isLoading,
  error,
  onRetry,
  children,
  disabledTitle = "This feature is not enabled",
  disabledHint,
}: Props) {
  if (isLoading) {
    return (
      <Card className="trading-card border-trading-bg-card">
        <CardContent className="flex items-center justify-center gap-3 py-12 text-trading-text/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const api = error instanceof ApiError ? error : null;

    // Feature switched off — informational, not an error.
    if (api?.isDisabled) {
      return (
        <Card className="trading-card border-trading-bg-card">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PowerOff className="h-8 w-8 text-trading-text/40" />
            <div>
              <p className="font-semibold text-trading-text">{disabledTitle}</p>
              <p className="mt-1 max-w-md text-sm text-trading-text/60">
                {disabledHint ?? api.message}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const offline = api?.code === "NETWORK_ERROR";
    const unauthorized = api?.isUnauthorized;

    return (
      <Card className="trading-card border-trading-bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          {offline ? (
            <WifiOff className="h-8 w-8 text-trading-loss" />
          ) : (
            <AlertCircle className="h-8 w-8 text-trading-loss" />
          )}
          <div>
            <p className="loss-text">
              {offline
                ? "Cannot reach the API"
                : unauthorized
                  ? "Not authorised"
                  : "Something went wrong"}
            </p>
            <p className="mt-1 max-w-md text-sm text-trading-text/60">
              {unauthorized
                ? "Your session has expired or you are not signed in. Sign in again to continue."
                : (api?.message ?? "Unexpected error")}
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export default ApiState;
