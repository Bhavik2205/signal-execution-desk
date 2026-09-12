import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, RotateCcw, Save, SlidersHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import {
  SETTINGS_SECTIONS,
  useSaveSettings,
  useSettings,
  type SettingsSectionName,
} from "@/hooks/useTradingApi";
import { ApiError } from "@/lib/api";

/**
 * Settings editor backed by /api/v1/settings.
 *
 * Each section is stored as an opaque JSONB blob whose shape is not fixed by
 * the backend, so this edits JSON directly rather than inventing a form whose
 * fields would silently disagree with whatever the server actually stores.
 */
export function LiveSettingsPanel() {
  const [section, setSection] = useState<SettingsSectionName>("general");
  const { data, isLoading, error, refetch } = useSettings(section);
  const save = useSaveSettings();
  const { toast } = useToast();

  const [text, setText] = useState("{}");
  const [dirty, setDirty] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Reload the editor whenever the fetched section changes, unless the user
  // has unsaved edits — clobbering their typing would be worse than staleness.
  useEffect(() => {
    if (data && !dirty) {
      setText(JSON.stringify(data.data ?? {}, null, 2));
      setJsonError(null);
    }
  }, [data, dirty]);

  // Switching tabs discards the draft deliberately; carrying one section's
  // JSON into another would save it under the wrong key.
  const onSectionChange = (next: string) => {
    setSection(next as SettingsSectionName);
    setDirty(false);
    setJsonError(null);
  };

  const onChange = (v: string) => {
    setText(v);
    setDirty(true);
    try {
      const parsed = JSON.parse(v);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("Settings must be a JSON object.");
      } else {
        setJsonError(null);
      }
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const onSave = async () => {
    if (jsonError) return;
    try {
      await save.mutateAsync({ section, data: JSON.parse(text) });
      setDirty(false);
      toast({ title: "Settings saved", description: `Section: ${section}` });
    } catch (e) {
      toast({
        title: "Could not save settings",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const onReset = () => {
    setText(JSON.stringify(data?.data ?? {}, null, 2));
    setDirty(false);
    setJsonError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="trading-card border-trading-bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-trading-text">
            <SlidersHorizontal className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={section} onValueChange={onSectionChange}>
            <TabsList className="flex flex-wrap">
              {SETTINGS_SECTIONS.map((s) => (
                <TabsTrigger key={s} value={s} className="capitalize">
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-trading-text/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : error ? (
            <div className="space-y-3 py-4">
              <p className="loss-text text-sm">
                {error instanceof ApiError ? error.message : "Could not load settings"}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="settings-json">
                  {section} settings (JSON)
                </Label>
                <Textarea
                  id="settings-json"
                  value={text}
                  onChange={(e) => onChange(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  className="font-mono text-sm"
                />
              </div>

              {jsonError && (
                <div className="flex items-start gap-2 rounded-md border border-trading-loss/40 bg-trading-loss/10 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-trading-loss" />
                  <p className="text-sm text-trading-text/80">{jsonError}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={onSave} disabled={!dirty || !!jsonError || save.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" onClick={onReset} disabled={!dirty}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Discard changes
                </Button>
                {dirty && !jsonError && (
                  <span className="text-xs text-trading-info">Unsaved changes</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-trading-text/50">
        Sections are stored as JSONB and the server does not enforce a schema
        beyond the section name, so this edits the document directly. Secrets
        saved here are stored as given — the settings endpoint does not encrypt
        them, unlike notification channel credentials.
      </p>
    </div>
  );
}

export default LiveSettingsPanel;
