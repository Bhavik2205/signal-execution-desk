import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Layers, Rocket } from 'lucide-react'; // Added more relevant icons

// --- MOCK DATA (Embedded directly for single-file solution) ---
const mockModels = [
  {
    id: 'price_predictor_v3',
    name: 'Price Action Predictor',
    type: 'RandomForestRegressor',
    accuracy: 0.885, // Use decimal for easier calculations and formatting
    f1Score: 0.85, // New metric
    status: 'active',
    lastTrained: '2025-05-31 20:30:00 IST', // Precise timestamp
    nextRetrain: '2025-06-01 03:00:00 IST', // When next retrain is scheduled
    prediction: 'BULLISH', // Target prediction, e.g., for next candle
    confidence: 0.75, // Confidence score for prediction
    dataFreshness: '5 min ago', // How recent is the data it's using
    trainingProgress: null // Null if not training
  },
  {
    id: 'volatility_estimator_v2',
    name: 'Real-time Volatility',
    type: 'XGBoostClassifier',
    accuracy: 0.921,
    f1Score: 0.90,
    status: 'training',
    lastTrained: '2025-05-30 18:00:00 IST',
    nextRetrain: 'In 4 hours', // More user-friendly
    prediction: 'HIGH', // Prediction for volatility
    confidence: 0.88,
    dataFreshness: '1 min ago',
    trainingProgress: 72 // Current training progress
  },
  {
    id: 'sentiment_analyzer_v1',
    name: 'Market Sentiment',
    type: 'LSTM (Transformer)',
    accuracy: 0.843,
    f1Score: 0.80,
    status: 'active',
    lastTrained: '2025-05-31 16:00:00 IST',
    nextRetrain: 'Daily (2 AM IST)',
    prediction: 'NEUTRAL', // Overall market sentiment
    confidence: 0.65,
    dataFreshness: '10 sec ago',
    trainingProgress: null
  },
  {
    id: 'risk_management_engine',
    name: 'Dynamic Risk Adjuster',
    type: 'Reinforcement Learning',
    accuracy: 0.950, // This could represent effectiveness in reducing drawdowns
    f1Score: null, // Not applicable for this model type
    status: 'active',
    lastTrained: '2025-05-29 09:00:00 IST',
    nextRetrain: 'Weekly',
    prediction: 'OPTIMAL', // Risk status
    confidence: 0.99,
    dataFreshness: '2 min ago',
    trainingProgress: null
  }
];
// --- END MOCK DATA ---

export function MLModelsPanel() {
  const [models, setModels] = useState(mockModels);

  // Helper function for status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white border-green-700';
      case 'training':
        return 'bg-yellow-600 text-white border-yellow-700 animate-pulse'; // Added pulse for training
      case 'inactive':
        return 'bg-gray-700 text-gray-300 border-gray-600';
      case 'error': // Added an error state for robustness
        return 'bg-red-700 text-white border-red-800';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  // Helper function for prediction text color and icon
  const getPredictionDisplay = (prediction) => {
    let colorClass = 'text-gray-400';
    let icon = null;
    switch (prediction) {
      case 'BULLISH':
        colorClass = 'text-green-400'; // Brighter green for dark mode
        icon = <TrendingUp className="w-4 h-4" />;
        break;
      case 'BEARISH':
        colorClass = 'text-red-400'; // Brighter red for dark mode
        icon = <TrendingDown className="w-4 h-4" />;
        break;
      case 'HIGH':
        colorClass = 'text-orange-400'; // Orange for warnings/high activity
        icon = <AlertTriangle className="w-4 h-4" />;
        break;
      case 'NEUTRAL':
        colorClass = 'text-blue-400'; // Blue for informational
        icon = <Layers className="w-4 h-4" />;
        break;
      case 'OPTIMAL':
        colorClass = 'text-teal-400'; // Teal for good/optimal states
        icon = <CheckCircle className="w-4 h-4" />;
        break;
      default:
        break;
    }
    return (
      <span className={`flex items-center gap-1 ${colorClass}`}>
        {icon} {prediction}
      </span>
    );
  };

  const handleRetrainAll = () => {
    alert('Initiating retraining for all models! (This is a mock action)');
    // In a real app, you'd send an API request here
    setModels(prevModels => prevModels.map(model => ({
      ...model,
      status: 'training',
      trainingProgress: 0,
      lastTrained: 'Training now...', // Update status text
      nextRetrain: 'N/A' // N/A while training
    })));
  };


  return (
    <div className="p-4 sm:p-6 bg-black text-gray-100 min-h-screen">
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{mockModels.length}</div>
            <p className="text-xs text-gray-500">
              Deployed in production
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Models Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {models.filter(m => m.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">
              Currently generating signals
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Models Training</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {models.filter(m => m.status === 'training').length}
            </div>
            <p className="text-xs text-gray-500">
              Undergoing retraining
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Accuracy</CardTitle>
            <Rocket className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {(models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              Across all models
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id} className="bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-pink-300 flex items-center gap-2">
                    {model.name}
                    <span className="text-sm text-gray-400 ml-2">({model.type})</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Version: {model.modelVersion}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-1 ${getStatusBadgeClass(model.status)}`}
                  >
                    <span className="flex items-center gap-1">
                      {model.status === 'active' && <CheckCircle className="w-3 h-3" />}
                      {model.status === 'training' && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {model.status === 'inactive' && <Clock className="w-3 h-3" />}
                      {model.status.toUpperCase()}
                    </span>
                  </Badge>
                  {model.status === 'training' && model.trainingProgress !== null && (
                    <div className="w-20">
                      <Progress value={model.trainingProgress} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                      <span className="text-xs text-gray-400">{model.trainingProgress}%</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 transition-colors"
                    onClick={() => alert(`Retraining ${model.name}...`)} // Mock action
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Retrain
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4 text-sm mt-4 border-t border-gray-800 pt-4">
                <div>
                  <p className="text-gray-500">Accuracy</p>
                  <p className="font-bold text-green-400">{(model.accuracy * 100).toFixed(1)}%</p>
                </div>
                {model.f1Score !== null && ( // Conditionally render F1 Score
                  <div>
                    <p className="text-gray-500">F1 Score</p>
                    <p className="font-bold text-yellow-400">{(model.f1Score * 100).toFixed(1)}%</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Last Trained</p>
                  <p className="font-bold text-gray-300 text-xs">{model.lastTrained}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Retrain</p>
                  <p className="font-bold text-gray-300 text-xs">{model.nextRetrain}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prediction</p>
                  {getPredictionDisplay(model.prediction)}
                </div>
                <div>
                  <p className="text-gray-500">Confidence</p>
                  <p className="font-bold text-blue-400">{(model.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Data Freshness</p>
                  <p className="font-bold text-cyan-400">{model.dataFreshness}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900 border border-gray-700 mt-8 p-4 flex justify-center">
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold transition-colors"
          onClick={handleRetrainAll}
        >
          <RefreshCw className="w-5 h-5 mr-2" /> Retrain All Models
        </Button>
      </Card>

      <div className="text-center text-sm text-gray-600 py-6 mt-8">
        ML Models Dashboard | Data for demonstration purposes only.
      </div>
    </div>
  );
}