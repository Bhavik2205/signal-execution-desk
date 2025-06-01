import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Meh, TrendingUp, TrendingDown, AlignJustify } from 'lucide-react'; // Added icons

// --- MOCK DATA (Embedded directly) ---
const mockSentimentData = [
  {
    headline: "RBI maintains repo rate at 6.5%, signals cautious stance amidst global uncertainties.",
    source: "Economic Times",
    sentiment: "neutral",
    score: 0.15, // Score between -1 and 1
    time: "2025-05-31 22:50:00 IST", // Precise timestamp
    impact: "Moderate", // New: perceived market impact
    category: "Macroeconomics" // New: category for filtering
  },
  {
    headline: "Nifty IT index surges 3% on strong Q3 earnings outlook and US tech rebound.",
    source: "Business Standard",
    sentiment: "positive",
    score: 0.78,
    time: "2025-05-31 22:38:00 IST",
    impact: "High",
    category: "Sectoral"
  },
  {
    headline: "Crude oil prices fall on demand concerns amid rising global inventories.",
    source: "Reuters",
    sentiment: "negative",
    score: -0.65,
    time: "2025-05-31 22:25:00 IST",
    impact: "High",
    category: "Commodities"
  },
  {
    headline: "FII buying continues for third consecutive session, boosting market liquidity.",
    source: "Moneycontrol",
    sentiment: "positive",
    score: 0.82,
    time: "2025-05-31 22:08:00 IST",
    impact: "High",
    category: "Market Flow"
  },
  {
    headline: "Pharmaceutical sector sees mixed reactions after new drug approval delays.",
    source: "Livemint",
    sentiment: "neutral",
    score: -0.10,
    time: "2025-05-31 21:55:00 IST",
    impact: "Low",
    category: "Sectoral"
  },
  {
    headline: "Global chip shortage expected to ease by Q4, benefitting auto industry.",
    source: "Bloomberg",
    sentiment: "positive",
    score: 0.55,
    time: "2025-05-31 21:30:00 IST",
    impact: "Moderate",
    category: "Global Economy"
  }
];
// --- END MOCK DATA ---

export function SentimentPanel() {
  const [sentimentData] = useState(mockSentimentData); // Changed to const as no filtering/updates handled within this component

  const getSentimentBadgeClass = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-700 text-white border-green-800';
      case 'negative':
        return 'bg-red-700 text-white border-red-800';
      case 'neutral':
        return 'bg-blue-700 text-white border-blue-800';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 mr-1" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 mr-1" />;
      case 'neutral':
        return <Meh className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getScoreColorClass = (score) => {
    if (score > 0) return 'text-green-400';
    if (score < 0) return 'text-red-400';
    return 'text-blue-400';
  };

  const overallSentimentScore = useMemo(() => {
    if (sentimentData.length === 0) return 0;
    return sentimentData.reduce((sum, item) => sum + item.score, 0) / sentimentData.length;
  }, [sentimentData]);

  const getOverallSentimentDisplay = (score) => {
    let sentimentText = 'NEUTRAL';
    let colorClass = 'text-blue-400';
    let icon = <AlignJustify className="w-5 h-5 mr-1" />;

    if (score > 0.3) { // Adjusted thresholds for clearer categories
      sentimentText = 'BULLISH';
      colorClass = 'text-green-400';
      icon = <TrendingUp className="w-5 h-5 mr-1" />;
    } else if (score < -0.3) {
      sentimentText = 'BEARISH';
      colorClass = 'text-red-400';
      icon = <TrendingDown className="w-5 h-5 mr-1" />;
    }

    return (
      <Badge
        variant="outline"
        className={`px-3 py-1 text-sm font-bold border-2 ${
          score > 0.3 ? 'border-green-600 bg-green-900/30' :
          score < -0.3 ? 'border-red-600 bg-red-900/30' :
          'border-blue-600 bg-blue-900/30'
        } ${colorClass}`}
      >
        <span className="flex items-center">
          {icon} Overall: {sentimentText} ({score.toFixed(2)})
        </span>
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-black text-gray-100 min-h-screen">
      <Card className="bg-gray-900 border border-gray-700 mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-300">Aggregated Sentiment</CardTitle>
          {getOverallSentimentDisplay(overallSentimentScore)}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            This panel provides a consolidated view of current market sentiment derived from various news sources and data feeds.
            The **Overall Sentiment** badge reflects the average sentiment score, offering a quick market pulse.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center text-green-400">
                <ThumbsUp className="w-5 h-5 mr-2" /> Positive articles: {sentimentData.filter(d => d.sentiment === 'positive').length}
            </div>
            <div className="flex items-center text-red-400">
                <ThumbsDown className="w-5 h-5 mr-2" /> Negative articles: {sentimentData.filter(d => d.sentiment === 'negative').length}
            </div>
            <div className="flex items-center text-blue-400">
                <Meh className="w-5 h-5 mr-2" /> Neutral articles: {sentimentData.filter(d => d.sentiment === 'neutral').length}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sentimentData.map((item, index) => (
          <Card key={index} className="bg-gray-900 border border-gray-700 hover:border-purple-500 transition-colors duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <p className="text-base font-medium text-gray-100 leading-tight">
                    {item.headline}
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Source:</span> {item.source}
                    </p>
                    <span className="text-gray-600">•</span>
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Time:</span> {new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end justify-between min-w-[100px]">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-1 mb-1 flex items-center ${getSentimentBadgeClass(item.sentiment)}`}
                  >
                    {getSentimentIcon(item.sentiment)} {item.sentiment.toUpperCase()}
                  </Badge>
                  <p className={`text-sm font-bold ${getScoreColorClass(item.score)}`}>
                    Score: {item.score > 0 ? '+' : ''}{item.score.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mt-3 border-t border-gray-800 pt-3">
                  <div>
                      <p className="text-gray-500">Impact</p>
                      <p className="font-bold text-gray-300">{item.impact}</p>
                  </div>
                  <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-bold text-gray-300">{item.category}</p>
                  </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 py-6 mt-8">
        Market Sentiment Analysis by ML Bot | Data updated real-time (mock data shown).
      </div>
    </div>
  );
}