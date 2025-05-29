
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const models = [
  {
    id: 'price_predictor',
    name: 'Price Predictor',
    type: 'RandomForest',
    accuracy: 78.5,
    status: 'active',
    lastTrained: '2 hours ago',
    prediction: 'BULLISH'
  },
  {
    id: 'volatility_model',
    name: 'Volatility Model',
    type: 'XGBoost',
    accuracy: 82.1,
    status: 'training',
    lastTrained: '1 day ago',
    prediction: 'HIGH'
  },
  {
    id: 'sentiment_analyzer',
    name: 'Sentiment Analyzer',
    type: 'LSTM',
    accuracy: 74.3,
    status: 'active',
    lastTrained: '6 hours ago',
    prediction: 'NEUTRAL'
  }
];

export function MLModelsPanel() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-trading-profit text-trading-profit';
      case 'training':
        return 'border-trading-warning text-trading-warning';
      case 'inactive':
        return 'border-trading-text-muted text-trading-text-muted';
      default:
        return 'border-trading-text-muted text-trading-text-muted';
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'BULLISH':
        return 'text-trading-profit';
      case 'BEARISH':
        return 'text-trading-loss';
      case 'HIGH':
        return 'text-trading-warning';
      default:
        return 'text-trading-info';
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-trading-text">ML Models</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          className="border-trading-info text-trading-info hover:bg-trading-info hover:text-white"
        >
          Retrain All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className="p-4 bg-trading-bg rounded-lg border border-trading-bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-trading-text">{model.name}</h3>
                  <p className="text-sm text-trading-text-muted">{model.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${getStatusColor(model.status)}`}
                  >
                    {model.status.toUpperCase()}
                  </Badge>
                  {model.status === 'training' && (
                    <div className="w-16">
                      <Progress value={65} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-trading-text-muted">Accuracy</p>
                  <p className="font-semibold text-trading-text">{model.accuracy}%</p>
                </div>
                <div>
                  <p className="text-trading-text-muted">Last Trained</p>
                  <p className="font-semibold text-trading-text">{model.lastTrained}</p>
                </div>
                <div>
                  <p className="text-trading-text-muted">Prediction</p>
                  <p className={`font-semibold ${getPredictionColor(model.prediction)}`}>
                    {model.prediction}
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
