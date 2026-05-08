import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Loader2, Activity, ShieldAlert, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const Anomalies = () => {
  const [data, setData] = useState({
    total_records_evaluated: 0,
    anomaly_count: 0,
    anomalies: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnomalies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAnomalies();
      if (response.status === 'success') {
        setData({
          total_records_evaluated: response.total_records_evaluated || 0,
          anomaly_count: response.anomaly_count || 0,
          anomalies: response.anomalies || []
        });
      } else {
        setError(response.message || 'Failed to fetch anomaly data.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the monitoring service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-surface-900 tracking-tight">Anomaly Monitoring</h2>
            <p className="text-surface-500 mt-1">Real-time detection of unusual patterns in retail data using Isolation Forest ML models.</p>
          </div>
        </div>
        <button 
          onClick={fetchAnomalies}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-50 hover:bg-surface-100 border border-surface-200 text-surface-700 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16 text-surface-900" />
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-surface-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Records Evaluated</p>
            <p className="text-2xl font-bold text-surface-900">
              {isLoading ? '-' : data.total_records_evaluated.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-16 h-16 text-amber-500" />
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Anomalies Detected</p>
            <p className="text-2xl font-bold text-amber-600">
              {isLoading ? '-' : data.anomaly_count.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">System Status</p>
            <p className={`text-lg font-bold ${data.anomaly_count > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {isLoading ? '-' : data.anomaly_count > 0 ? 'Action Required' : 'Healthy'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Monitoring System Alert</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
          <h3 className="font-semibold text-surface-900">Anomaly Log</h3>
          {data.anomaly_count > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              Critical
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-surface-200">
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Store</th>
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Weekly Sales</th>
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">CPI</th>
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Unemployment</th>
                <th className="py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                    <p className="text-surface-500 mt-2 text-sm">Evaluating isolation forest model...</p>
                  </td>
                </tr>
              ) : data.anomalies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-surface-500">
                    <ShieldAlert className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                    <p>No anomalies detected in the current dataset.</p>
                  </td>
                </tr>
              ) : (
                data.anomalies.map((anomaly, index) => (
                  <tr key={index} className="hover:bg-amber-50/30 transition-colors bg-red-50/10">
                    <td className="py-4 px-6 text-sm text-surface-900 font-medium whitespace-nowrap">
                      {anomaly.Date || `${anomaly.Year}-W${anomaly.Week}`}
                    </td>
                    <td className="py-4 px-6 text-sm text-surface-900">
                      Store #{anomaly.Store}
                    </td>
                    <td className="py-4 px-6 text-sm text-surface-900 text-right font-medium text-amber-700">
                      {formatCurrency(anomaly.Weekly_Sales)}
                    </td>
                    <td className="py-4 px-6 text-sm text-surface-600 text-right">
                      {anomaly.CPI?.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-surface-600 text-right">
                      {anomaly.Unemployment}%
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Anomaly
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder if needed */}
        {!isLoading && data.anomalies.length > 0 && (
          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 text-xs text-surface-500 flex justify-between items-center">
            <span>Showing {data.anomalies.length} recorded anomalies</span>
            <span className="text-amber-600 font-medium cursor-pointer hover:underline">Export to CSV</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
