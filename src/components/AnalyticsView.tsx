import React, { useMemo } from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { CATEGORY_LABELS } from '../initialData';
import { 
  BarChart3, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Wrench, 
  PieChart, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';

interface AnalyticsViewProps {
  appliances: Appliance[];
  logs: MaintenanceLog[];
}

export default function AnalyticsView({ appliances, logs }: AnalyticsViewProps) {
  // Stats Calculations
  const stats = useMemo(() => {
    // Total spent
    const totalSpent = logs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
    
    // Average spent per appliance
    const avgSpentPerAppliance = appliances.length > 0 
      ? Math.round(totalSpent / appliances.length) 
      : 0;

    // Highest log cost
    const maxTicket = logs.length > 0
      ? Math.max(...logs.map(log => log.cost))
      : 0;

    // Expenditures by Category
    const categoryExpenses: Record<string, number> = {
      kitchen: 0,
      laundry: 0,
      ac: 0,
      cleaning: 0,
      entertainment: 0,
      other: 0,
    };

    logs.forEach(log => {
      const app = appliances.find(a => a.id === log.applianceId);
      if (app) {
        categoryExpenses[app.category] = (categoryExpenses[app.category] || 0) + Number(log.cost || 0);
      } else {
        categoryExpenses.other = (categoryExpenses.other || 0) + Number(log.cost || 0);
      }
    });

    // Expenses by Appliance (for ranking)
    const applianceExpensesMap: Record<string, { name: string; cost: number; logsCount: number; brand: string }> = {};
    
    appliances.forEach(app => {
      applianceExpensesMap[app.id] = { name: app.name, brand: app.brand, cost: 0, logsCount: 0 };
    });

    logs.forEach(log => {
      if (applianceExpensesMap[log.applianceId]) {
        applianceExpensesMap[log.applianceId].cost += Number(log.cost || 0);
        applianceExpensesMap[log.applianceId].logsCount += 1;
      }
    });

    const rankedAppliances = Object.values(applianceExpensesMap)
      .sort((a, b) => b.cost - a.cost);

    return {
      totalSpent,
      avgSpentPerAppliance,
      maxTicket,
      categoryExpenses,
      rankedAppliances
    };
  }, [appliances, logs]);

  // Transform Category expenses for simple custom SVG rendering
  const categoryChartData = useMemo(() => {
    const rawData = Object.entries(stats.categoryExpenses).map(([cat, cost]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat] || 'أخرى',
      cost: Number(cost),
    }));
    
    const maxCost = Math.max(...rawData.map(d => d.cost), 1);
    
    return rawData.map(d => ({
      ...d,
      percentage: Math.round((d.cost / (stats.totalSpent || 1)) * 100),
      barRatio: d.cost / maxCost // for SVG height sizes
    }));
  }, [stats.categoryExpenses, stats.totalSpent]);

  // Color schemas for category indicator
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'kitchen': return '#f59e0b'; // Amber-500
      case 'laundry': return '#3b82f6'; // Blue-500
      case 'ac': return '#06b6d4'; // Cyan-500
      case 'cleaning': return '#14b8a6'; // Teal-500
      case 'entertainment': return '#a855f7'; // Purple-500
      default: return '#64748b'; // Slate-500
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title */}
      <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400 font-bold" />
          <span>التحليلات المالية وتوزيع نفقات الصيانة</span>
        </h2>
        <p className="text-xs text-white/55 mt-1">
          رؤية شاملة ومخططات بيانية للتكاليف الإجمالية وتوزيع المصاريف على فئات أجهزتك المختلفة.
        </p>
      </div>

      {/* KPI statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 rounded-xl shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">إجمالي نفقات الصيانة</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 font-mono">
              {stats.totalSpent} <span className="text-xs text-white/40 font-bold">ريال</span>
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">شاملة كامل العمليات المسجلة</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">معدل التكلفة لكل جهاز</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 font-mono">
              {stats.avgSpentPerAppliance} <span className="text-xs text-white/40 font-bold">ريال/جهاز</span>
            </p>
            <span className="text-[10px] text-white/40 block mt-0.5">متوسط التكلفة الموزعة</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-300 border border-amber-500/15 rounded-xl shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">أعلى قيمة فاتورة منفردة</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 font-mono">
              {stats.maxTicket} <span className="text-xs text-white/40 font-bold">ريال سعودي</span>
            </p>
            <span className="text-[10px] text-white/40 block mt-0.5">أغلى تكلفة في السجل</span>
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Category Bar Chart Card (7 cols) */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2 flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-indigo-450" />
            <span>توزيع التكاليف المالية حسب الأقسام والتصنيفات</span>
          </h3>

          {stats.totalSpent === 0 ? (
            <p className="text-white/40 text-xs py-10 text-center">لا توجد بيانات صيانة مسجلة حتى الآن لحساب المخطط التوجيهي.</p>
          ) : (
            <div className="space-y-5 pt-3">
              {/* Dynamic Columns SVG simulation */}
              <div className="h-64 flex items-end justify-between border-b border-white/10 pb-1 px-4 relative">
                {/* SVG background grid lines */}
                <div className="absolute inset-x-0 top-0 border-b border-white/5 text-[10px] text-white/20 pt-1 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-1/3 border-b border-white/5 text-[10px] text-white/20 pt-1 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-2/3 border-b border-white/5 text-[10px] text-white/20 pt-1 pointer-events-none"></div>

                {categoryChartData.map(item => (
                  <div key={item.category} className="flex flex-col items-center flex-1 mx-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 border border-white/10 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none shadow-xl whitespace-nowrap z-20">
                      {item.cost} ريال ({item.percentage}%)
                    </div>
                    
                    {/* Rounded Animated Bar */}
                    <div 
                      className="w-8 sm:w-10 rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-lg"
                      style={{ 
                        height: `${Math.max(item.barRatio * 180, 8)}px`, 
                        backgroundColor: getCategoryColor(item.category) 
                      }}
                    ></div>

                    {/* Label below bar */}
                    <span className="text-[10px] text-white/60 font-semibold mt-2 text-center line-clamp-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart Legend / Detail rows */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {categoryChartData.map(item => (
                  <div key={item.category} className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 text-xs shadow-3xs hover:bg-white/10 transition">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                    ></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{item.label}</p>
                      <p className="text-[10px] text-white/40 font-bold">{item.cost} ريال • {item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Most Expensive appliances top-list (5 cols) */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-indigo-400" />
            <span>الأجهزة الأكثر استهلاكاً لمصاريف الصيانة</span>
          </h3>

          <div className="space-y-3">
            {stats.rankedAppliances.slice(0, 5).map((app, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                    idx === 1 ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' : 
                    idx === 2 ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : 'bg-white/10 text-white/50 border-white/10'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-xs truncate">
                      {app.name}
                    </h4>
                    <p className="text-[10px] text-white/40">
                      {app.brand} • {app.logsCount} صيانة
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-extrabold text-white font-mono">{app.cost}</span>
                  <span className="text-[10px] text-white/40 mr-1">ريال</span>
                  <p className="text-[9px] text-white/30 mt-0.5">إجمالي التكلفة</p>
                </div>
              </div>
            ))}

            {stats.rankedAppliances.length === 0 && (
              <p className="text-white/40 text-xs text-center py-10">لا توجد بيانات أجهزة لحساب الاستهلاك.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
