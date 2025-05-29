
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sentimentData = [
  {
    headline: "RBI maintains repo rate at 6.5%, signals cautious stance",
    source: "Economic Times",
    sentiment: "neutral",
    score: 0.15,
    time: "2 min ago"
  },
  {
    headline: "Nifty IT index surges 3% on strong Q3 earnings outlook",
    source: "Business Standard",
    sentiment: "positive",
    score: 0.78,
    time: "15 min ago"
  },
  {
    headline: "Crude oil prices fall on demand concerns",
    source: "Reuters",
    sentiment: "negative",
    score: -0.65,
    time: "28 min ago"
  },
  {
    headline: "FII buying continues for third consecutive session",
    source: "Moneycontrol",
    sentiment: "positive",
    score: 0.82,
    time: "45 min ago"
  }
];

export function SentimentPanel() {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-trading-profit text-trading-profit';
      case 'negative':
        return 'border-trading-loss text-trading-loss';
      case 'neutral':
        return 'border-trading-info text-trading-info';
      default:
        return 'border-trading-text-muted text-trading-text-muted';
    }
  };

  const overallSentiment = sentimentData.reduce((sum, item) => sum + item.score, 0) / sentimentData.length;

  return (
    <Card className="trading-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-trading-text">Market Sentiment</CardTitle>
        <Badge 
          variant="outline"
          className={`${
            overallSentiment > 0.2 
              ? 'border-trading-profit text-trading-profit'
              : overallSentiment < -0.2
              ? 'border-trading-loss text-trading-loss'
              : 'border-trading-info text-trading-info'
          }`}
        >
          Overall: {overallSentiment > 0.2 ? 'BULLISH' : overallSentiment < -0.2 ? 'BEARISH' : 'NEUTRAL'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sentimentData.map((item, index) => (
            <div key={index} className="p-3 bg-trading-bg rounded-lg border border-trading-bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <p className="text-sm font-medium text-trading-text leading-tight">
                    {item.headline}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-trading-text-muted">{item.source}</p>
                    <span className="text-xs text-trading-text-muted">•</span>
                    <p className="text-xs text-trading-text-muted">{item.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${getSentimentColor(item.sentiment)}`}
                  >
                    {item.sentiment.toUpperCase()}
                  </Badge>
                  <p className={`text-xs font-mono mt-1 ${
                    item.score > 0 ? 'text-trading-profit' : 
                    item.score < 0 ? 'text-trading-loss' : 'text-trading-info'
                  }`}>
                    {item.score > 0 ? '+' : ''}{item.score.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
