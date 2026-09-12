import React, { useState } from "react";
import { Bell, CheckCircle2, Clock, Send, Trash2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

import {
  useDeleteNotificationChannel,
  useNotificationChannels,
  useNotificationHistory,
  useSaveNotificationChannel,
  useTestNotification,
} from "@/hooks/useTradingApi";
import { ApiError } from "@/lib/api";
import type { ChannelType } from "@/lib/api-types";
import { ApiState } from "./ApiState";

/** Per-channel credential fields. Values are write-only: the API never
 *  returns them, so the inputs start blank even for a configured channel. */
const CHANNEL_FIELDS: Record<ChannelType, { key: string; label: string; placeholder: string }[]> = {
  telegram: [
    { key: "botToken", label: "Bot token", placeholder: "123456:ABC-DEF..." },
    { key: "chatId", label: "Chat ID", placeholder: "-1001234567890" },
  ],
  whatsapp: [
    { key: "apiUrl", label: "API URL", placeholder: "https://api.example.com/send" },
    { key: "phoneNumber", label: "Phone number", placeholder: "+919876543210" },
  ],
};

const CHANNELS: ChannelType[] = ["telegram", "whatsapp"];

function statusBadge(status: string) {
  switch (status) {
    case "SENT":
      return (
        <Badge variant="outline" className="border-trading-profit text-trading-profit">
          SENT
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="outline" className="border-trading-loss text-trading-loss">
          FAILED
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-trading-info text-trading-info">
          PENDING
        </Badge>
      );
  }
}

export function NotificationsPanel() {
  const channels = useNotificationChannels();
  const history = useNotificationHistory(50);

  return (
    <ApiState
      isLoading={channels.isLoading}
      error={channels.error}
      onRetry={() => channels.refetch()}
      disabledTitle="Notifications are unavailable"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {CHANNELS.map((type) => (
            <ChannelCard
              key={type}
              type={type}
              existing={channels.data?.find((c) => c.channel_type === type)}
            />
          ))}
        </div>

        <Card className="trading-card border-trading-bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-trading-text">
              <Clock className="h-5 w-5" />
              Delivery log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!history.data || history.data.length === 0 ? (
              <p className="py-8 text-center text-sm text-trading-text/50">
                Nothing sent yet.
              </p>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-mono text-xs">
                          {new Date(h.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">{h.channel_type}</TableCell>
                        <TableCell className="font-mono text-xs">{h.event_type}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">{h.message}</TableCell>
                        <TableCell>
                          {statusBadge(h.status)}
                          {h.error_message && (
                            <p className="mt-1 text-xs text-trading-loss">{h.error_message}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-trading-text/50">
          No delivery worker is running yet, so messages are recorded as PENDING and are not
          actually sent. Channel configuration and the log are live.
        </p>
      </div>
    </ApiState>
  );
}

function ChannelCard({
  type,
  existing,
}: {
  type: ChannelType;
  existing?: { is_enabled: boolean; configured: boolean };
}) {
  const save = useSaveNotificationChannel();
  const remove = useDeleteNotificationChannel();
  const test = useTestNotification();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(existing?.is_enabled ?? false);
  const [config, setConfig] = useState<Record<string, string>>({});

  const fields = CHANNEL_FIELDS[type];
  const anyFilled = fields.some((f) => (config[f.key] ?? "").trim() !== "");
  // The API rejects enabling a channel with no credentials, so mirror that
  // rule here rather than letting the user submit a request that will fail.
  const canEnable = anyFilled || existing?.configured;

  const onSave = async () => {
    try {
      await save.mutateAsync({ channel_type: type, is_enabled: enabled, config });
      setConfig({});
      toast({ title: `${type} saved` });
    } catch (e) {
      toast({
        title: "Could not save channel",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    try {
      await remove.mutateAsync(type);
      setEnabled(false);
      setConfig({});
      toast({ title: `${type} removed` });
    } catch (e) {
      toast({
        title: "Could not remove channel",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const onTest = async () => {
    try {
      const res = await test.mutateAsync(type);
      toast({ title: "Test queued", description: res?.note });
    } catch (e) {
      toast({
        title: "Could not queue test",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="trading-card border-trading-bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 capitalize text-trading-text">
          <Bell className="h-5 w-5" />
          {type}
        </CardTitle>
        <div className="flex items-center gap-2">
          {existing?.configured ? (
            <Badge variant="outline" className="border-trading-profit text-trading-profit">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              configured
            </Badge>
          ) : (
            <Badge variant="outline" className="border-trading-text/30 text-trading-text/50">
              <XCircle className="mr-1 h-3 w-3" />
              not configured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`${type}-${f.key}`}>{f.label}</Label>
            <Input
              id={`${type}-${f.key}`}
              type="password"
              autoComplete="off"
              placeholder={existing?.configured ? "•••••• (leave blank to keep)" : f.placeholder}
              value={config[f.key] ?? ""}
              onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Switch
              id={`${type}-enabled`}
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={!canEnable}
            />
            <Label htmlFor={`${type}-enabled`} className="cursor-pointer">
              Enabled
            </Label>
          </div>
          {!canEnable && (
            <span className="text-xs text-trading-text/50">Add credentials first</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onSave} disabled={save.isPending}>
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onTest}
            disabled={test.isPending || !existing?.is_enabled}
          >
            <Send className="mr-2 h-4 w-4" />
            Send test
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={remove.isPending || !existing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationsPanel;
