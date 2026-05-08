import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  DollarSign, TrendingUp, AlertTriangle, Bot, Lightbulb, ArrowRight, Activity, Calendar, AlertCircle
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { api } from '../services/api';

// --- Mock Data for Charts ---
const MOCK_SALES_TREND = [
  { name: 'Week 1', sales: 4000, forecast: 4200 },
  { name: 'Week 2', sales: 3000, forecast: 3100 },
  { name: 'Week 3', sales: 2000, forecast: 2200 },
  { name: 'Week 4', sales: 2780, forecast: 2900 },
  { name: 'Week 5', sales: 1890, forecast: 2000 },
  { name: 'Week 6', sales: 2390, forecast: 2500 },
  { name: 'Week 7', sales: 3490, forecast: 3600 },
];

const MOCK_MONTHLY_SALES = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 59000 },
  { month: 'Mar', revenue: 80000 },
  { month: 'Apr', revenue: 81000 },
  { month: 'May', revenue: 56000 },
  { month: 'Jun', revenue: 55000 },
  { month: 'Jul', revenue: 40000 },
];

const MOCK_ANOMALIES = [
  { name: 'Inventory Shortage', value: 35, color: '#f59e0b' },
  { name: 'Demand Spike', value: 45, color: '#10b981' },
  { name: 'Pricing Error', value: 20, color: '#ef4444' },
];

const MOCK_INSIGHTS = [
  {
    id: 1,
    title: "Holiday Season Forecast Update",
    content: "Our demand model predicts a 15% increase in electronics sales for Store #4 next week. Recommend increasing inventory for SKUs in this category.",
    type: "opportunity",
    time: "2 hours ago"
  },
  {
    id: 2,
    title: "Anomaly Detected: Store #12",
    content: "Unusual drop in fresh produce sales detected. Analyzing correlation with recent local weather patterns and supplier delivery delays.",
    type: "risk",
    time: "5 hours ago"
  },
  {
    id: 3,
    title: "Agent Performance",
    content: "RAG Agent successfully resolved 94% of operational queries this week without human intervention.",
    type: "info",
    time: "1 day ago"
  }
];

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    sales_change_percent: 0,
    forecast_sales: 0,
    forecast_change_percent: 0,
    anomaly_count: 0,
    anomaly_change_percent: 0,
    active_agents: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Live KPI Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await api.getDashboardMetrics();
        setMetrics({
          total_sales: data.total_sales || 0,
          sales_change_percent: data.sales_change_percent || 0,
          forecast_sales: data.forecast_sales || 0,
          forecast_change_percent: data.forecast_change_percent || 0,
          anomaly_count: data.anomaly_count || 0,
          anomaly_change_percent: data.anomaly_change_percent || 0,
          active_agents: data.active_agents || 3
        });
      } catch (err) {
        setError(err.message || "Failed to load live dashboard metrics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrencyCompact = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  const getTrend = (percent) => {
    if (percent > 0.01) return 'up';
    if (percent < -0.01) return 'down';
    return 'flat';
  };

  const formatPercent = (percent) => {
    return `${Math.abs(percent).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-surface-500 font-medium">Loading live enterprise analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-surface-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-surface-500 mt-1">Unified view of live retail performance and AI insights.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-50 px-4 py-2 rounded-lg border border-surface-200">
          <Calendar className="w-4 h-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">Live Data Sync</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Historical Sales" 
          value={formatCurrencyCompact(metrics.total_sales)} 
          icon={DollarSign} 
          trend={getTrend(metrics.sales_change_percent)} 
          trendValue={formatPercent(metrics.sales_change_percent)} 
          colorClass="text-brand-600"
        />
        <KPICard 
          title="Avg Forecasted Sales" 
          value={formatCurrencyCompact(metrics.forecast_sales)} 
          icon={TrendingUp} 
          trend={getTrend(metrics.forecast_change_percent)} 
          trendValue={formatPercent(metrics.forecast_change_percent)} 
          colorClass="text-blue-600"
        />
        <KPICard 
          title="Detected Anomalies" 
          value={metrics.anomaly_count.toString()} 
          icon={AlertTriangle} 
          trend={getTrend(metrics.anomaly_change_percent)} 
          trendValue={formatPercent(metrics.anomaly_change_percent)} 
          colorClass="text-red-500"
        />
        <KPICard 
          title="Active AI Agents" 
          value={metrics.active_agents.toString()} 
          icon={Bot} 
          trend="flat" 
          trendValue="Online" 
          colorClass="text-purple-600"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-surface-500" />
              Sales vs. Forecast Trend (Simulated)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SALES_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [formatCurrency(value), undefined]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="sales" name="Actual Sales" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-br from-surface-900 to-surface-800 p-6 rounded-xl border border-surface-700 shadow-lg flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-surface-700/50 pb-4">
            <div className="p-2 bg-brand-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="font-semibold text-white tracking-wide">Executive AI Insights</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {MOCK_INSIGHTS.map(insight => (
              <div key={insight.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                    insight.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed mb-3">
                  {insight.content}
                </p>
                <div className="flex justify-between items-center text-xs text-surface-500">
                  <span>Generated {insight.time}</span>
                  <button className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors group">
                    Review <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <h3 className="font-semibold text-surface-900 mb-6">YTD Revenue by Month (Simulated)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_MONTHLY_SALES} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Distribution */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-surface-900 mb-2">Anomaly Distribution (Simulated)</h3>
          <p className="text-sm text-surface-500 mb-4">Breakdown of ML-detected anomalies by category.</p>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_ANOMALIES}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_ANOMALIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
