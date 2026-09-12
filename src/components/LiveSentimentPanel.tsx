import React, { useState } from "react";
import { ExternalLink, Minus, Newspaper, ThumbsDown, ThumbsUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useSentiment } from "@/hooks/useTradingApi";
import type { SentimentArticle } from "@/lib/api-types";
import { ApiState } from "./ApiState";

const WINDOWS = [
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 },
] as const;

function labelTone(label: string): "profit" | "loss" | "neutral" {
  switch (label.toLowerCase()) {
    case "positive":
      return "profit";
    case "negative":
      return "loss";
    default:
      return "neutral";
  }
}

function LabelBadge({ label, analyzed }: { label: string; analyzed: boolean }) {
  if (!analyzed) {
    // An unscored article is not neutral — it simply has not been through the
    // model yet, and conflating the two would overstate neutral sentiment.
    return (
      <Badge variant="outline" className="border-trading-text/30 text-trading-text/50">
        unscored
      </Badge>
    );
  }
  const tone = labelTone(label);
  const cls =
    tone === "profit"
      ? "border-trading-profit text-trading-profit"
      : tone === "loss"
        ? "border-trading-loss text-trading-loss"
        : "border-trading-info text-trading-info";
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
}

export function LiveSentimentPanel() {
  const [hours, setHours] = useState<number>(24);
  const { data, isLoading, error, refetch } = useSentiment(hours, 50);

  return (
    <ApiState
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      disabledTitle="Sentiment data is unavailable"
    >
      {data && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {WINDOWS.map((wdw) => (
              <Button
                key={wdw.hours}
                size="sm"
                variant={hours === wdw.hours ? "default" : "outline"}
                onClick={() => setHours(wdw.hours)}
              >
                {wdw.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              icon={<ThumbsUp className="h-5 w-5" />}
              label="Positive"
              value={data.summary.positive}
              tone="profit"
            />
            <Tile
              icon={<Minus className="h-5 w-5" />}
              label="Neutral"
              value={data.summary.neutral}
              tone="info"
            />
            <Tile
              icon={<ThumbsDown className="h-5 w-5" />}
              label="Negative"
              value={data.summary.negative}
              tone="loss"
            />
            <Tile
              icon={<Newspaper className="h-5 w-5" />}
              label="Avg score"
              value={data.summary.avg_score.toFixed(3)}
              tone={
                data.summary.avg_score > 0.05
                  ? "profit"
                  : data.summary.avg_score < -0.05
                    ? "loss"
                    : "info"
              }
            />
          </div>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="text-trading-text">Model coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-trading-text/70">
                  Scored {data.summary.analyzed} of {data.summary.total} articles
                </span>
                <span className="font-mono">
                  {data.summary.total > 0
                    ? ((data.summary.analyzed / data.summary.total) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <Progress
                value={
                  data.summary.total > 0 ? (data.summary.analyzed / data.summary.total) * 100 : 0
                }
              />
              {data.summary.total > 0 && data.summary.analyzed === 0 && (
                <p className="text-xs text-trading-text/60">
                  No articles have been scored. The ONNX sentiment model needs a cgo-enabled
                  build — see the ML Models panel.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="text-trading-text">
                Recent news ({data.articles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.articles.length === 0 ? (
                <p className="py-8 text-center text-sm text-trading-text/50">
                  No articles in the last {hours}h. Is the news pipeline running?
                </p>
              ) : (
                <div className="space-y-3">
                  {data.articles.map((a) => (
                    <ArticleRow key={a.id} article={a} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ApiState>
  );
}

function ArticleRow({ article }: { article: SentimentArticle }) {
  return (
    <div className="rounded-md border border-trading-bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-trading-text">{article.title}</p>
          {article.description && (
            <p className="mt-1 line-clamp-2 text-sm text-trading-text/60">{article.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-trading-text/50">
            <span>{article.source}</span>
            <span>·</span>
            <span>{new Date(article.published_at).toLocaleString()}</span>
            {article.analyzed && (
              <>
                <span>·</span>
                <span className="font-mono">score {article.sentiment_score.toFixed(3)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <LabelBadge label={article.sentiment_label} analyzed={article.analyzed} />
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-trading-text/50 hover:text-trading-text"
              aria-label="Open article"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "profit" | "loss" | "info";
}) {
  const cls =
    tone === "profit" ? "profit-text" : tone === "loss" ? "loss-text" : "info-text";
  return (
    <Card className="trading-card border-trading-bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="text-trading-text/50">{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-xs text-trading-text/60">{label}</p>
          <p className={`font-mono text-lg ${cls}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveSentimentPanel;
