import { useState } from 'react';
import { Calculator, DollarSign, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

const Forecast = () => {
  const [formData, setFormData] = useState({
    Store: 1,
    Temperature: 65.0,
    Fuel_Price: 3.5,
    CPI: 211.0,
    Unemployment: 7.5,
    Year: 2024,
    Month: 5,
    Week: 20
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await api.getForecast(formData);
      if (response.status === 'success') {
        setPrediction(response.predicted_weekly_sales);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction from the model.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-surface-900 tracking-tight">Sales Forecasting</h2>
          <p className="text-surface-500 mt-1">Generate predictive insights for weekly store sales based on environmental and economic factors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-surface-500" />
              Prediction Parameters
            </h3>
          </div>
          
          <form onSubmit={handlePredict} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Store Number</label>
                <input 
                  type="number" name="Store" value={formData.Store} onChange={handleChange} required min="1"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Temperature (°F)</label>
                <input 
                  type="number" step="0.1" name="Temperature" value={formData.Temperature} onChange={handleChange} required
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Fuel Price ($)</label>
                <input 
                  type="number" step="0.01" name="Fuel_Price" value={formData.Fuel_Price} onChange={handleChange} required
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">CPI (Consumer Price Index)</label>
                <input 
                  type="number" step="0.1" name="CPI" value={formData.CPI} onChange={handleChange} required
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Unemployment Rate (%)</label>
                <input 
                  type="number" step="0.1" name="Unemployment" value={formData.Unemployment} onChange={handleChange} required
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Year</label>
                <input 
                  type="number" name="Year" value={formData.Year} onChange={handleChange} required min="2000"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Month</label>
                <input 
                  type="number" name="Month" value={formData.Month} onChange={handleChange} required min="1" max="12"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Week of Year</label>
                <input 
                  type="number" name="Week" value={formData.Week} onChange={handleChange} required min="1" max="53"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                Generate Prediction
              </button>
            </div>
          </form>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-xl border border-surface-700 shadow-lg overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-surface-700/50 bg-white/5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-400" />
                Prediction Result
              </h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center relative">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 text-surface-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                  <p className="text-sm animate-pulse">Analyzing ML model...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : prediction !== null ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-surface-400 text-sm font-medium uppercase tracking-wider mb-2">Predicted Weekly Sales</p>
                  <div className="text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                    {formatCurrency(prediction)}
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 px-3 py-1.5 rounded-full text-xs font-medium border border-brand-500/30">
                    <TrendingUp className="w-3.5 h-3.5" />
                    High confidence score
                  </div>
                </div>
              ) : (
                <div className="text-surface-500 flex flex-col items-center gap-3 opacity-60">
                  <Calculator className="w-12 h-12 mb-2" />
                  <p>Enter parameters and click generate to see the ML prediction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Forecast;
