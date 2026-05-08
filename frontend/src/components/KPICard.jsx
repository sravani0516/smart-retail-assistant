const KPICard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md">
      <div className={`absolute top-0 right-0 p-4 opacity-5 ${colorClass}`}>
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wider">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-50 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-bold text-surface-900 tracking-tight">{value}</p>
        
        {trend && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`inline-flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
            <span className="text-xs text-surface-400">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
