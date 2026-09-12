import React from "react";
import { AlertTriangle, Brain, CheckCircle2, FileBox, Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useModels } from "@/hooks/useTradingApi";
import { ApiState } from "./ApiState";

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function LiveModelsPanel() {
  const { data, isLoading, error, refetch } = useModels();

  return (
    <ApiState
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      disabledTitle="Model information is unavailable"
    >
      {data && (
        <div className="space-y-6">
          {/* Inference availability is the headline: without it, nothing in
              the sentiment pipeline can run, however many model files exist. */}
          <Card className="trading-card border-trading-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-trading-text">
                <Brain className="h-5 w-5" />
                Inference runtime
              </CardTitle>
              <Badge
                variant="outline"
                className={
                  data.inference_available
                    ? "border-trading-profit text-trading-profit"
                    : "border-trading-loss text-trading-loss"
                }
              >
                {data.inference_available ? "AVAILABLE" : "UNAVAILABLE"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                {data.inference_available ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-trading-profit" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-trading-loss" />
                )}
                <p className="text-sm text-trading-text/70">{data.inference_note}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-trading-text">
                <FileBox className="h-5 w-5" />
                Model files
                <span className="text-sm font-normal text-trading-text/50">
                  ({data.model_dir}/)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.files.length === 0 ? (
                <p className="py-6 text-center text-sm text-trading-text/50">
                  No .onnx files found in {data.model_dir}/.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.files.map((f) => (
                    <div
                      key={f.name}
                      className="flex items-center justify-between rounded-md border border-trading-bg-card px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-trading-text">{f.name}</p>
                        <p className="text-xs text-trading-text/50">
                          {mb(f.size_bytes)} · modified{" "}
                          {new Date(f.modified_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-trading-profit text-trading-profit">
                        present
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-trading-text">
                <Gauge className="h-5 w-5" />
                Sentiment pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-trading-text/70">Articles scored</span>
                  <span className="font-mono">
                    {data.pipeline.scored_articles} / {data.pipeline.total_articles} (
                    {data.pipeline.coverage_pct.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={data.pipeline.coverage_pct} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-trading-text/60">Last article</p>
                  <p className="font-mono text-trading-text">
                    {data.pipeline.last_article_at
                      ? new Date(data.pipeline.last_article_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-trading-text/60">Last scored</p>
                  <p className="font-mono text-trading-text">
                    {data.pipeline.last_analyzed_at
                      ? new Date(data.pipeline.last_analyzed_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-trading-text/50">
            Accuracy and F1 are deliberately not shown: nothing in this system measures them, and
            reporting invented figures would be worse than reporting none. Add an evaluation job
            that writes to the metrics table and they can appear here.
          </p>
        </div>
      )}
    </ApiState>
  );
}

export default LiveModelsPanel;
