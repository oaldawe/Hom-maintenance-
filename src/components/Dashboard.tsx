import React, { useMemo } from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { getWarrantyStatus, formatDateString, getDaysUntil } from '../dateUtils';
import { CATEGORY_LABELS } from '../initialData';
import { 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Settings, 
  Calendar, 
  Coins, 
  Plus, 
  Bell, 
  TrendingUp,
  Cpu,
  ChevronLeft
} from 'lucide-react';

interface DashboardProps {
  appliances: Appliance[];
  maintenanceLogs: MaintenanceLog[];
  onAddApplianceClick: () => void;
  onAddLogClick: () => void;
  onViewAppliance: (appliance: Appliance) => void;
  setActiveTab: (tab: 'dashboard' | 'appliances' | 'logs' | 'analytics') => void;
}

export default function Dashboard({
  appliances,
  maintenanceLogs,
  onAddApplianceClick,
  onAddLogClick,
  onViewAppliance,
  setActiveTab
}: DashboardProps) {

  // Computed Stats
  const stats = useMemo(() => {
    let totalSpent = 0;
    maintenanceLogs.forEach(log => {
      totalSpent += Number(log.cost || 0);
    });

    let expiredWarranties = 0;
    let expiringSoonWarranties = 0;
    let activeWarranties = 0;

    appliances.forEach(app => {
      const statusInfo = getWarrantyStatus(app.purchaseDate, app.warrantyMonths);
      if (statusInfo.status === 'expired') expiredWarranties++;
      else if (statusInfo.status === 'expiring_soon') expiringSoonWarranties++;
      else activeWarranties++;
    });

    // Scheduled/Upcoming maintenance dates
    const upcomingMaintenance = maintenanceLogs
      .filter(log => log.nextMaintenanceDate)
      .map(log => {
        const days = getDaysUntil(log.nextMaintenanceDate!);
        const applianceName = appliances.find(a => a.id === log.applianceId)?.name || 'جهاز غير معروف';
        return {
          ...log,
          applianceName,
          daysUntil: days,
        };
      })
      .filter(item => item.daysUntil > -30 && item.daysUntil <= 60) // Filter upcoming within 60 days, or past-due by max 30 days
      .sort((a, b) => a.daysUntil - b.daysUntil);

    // Filter warranties expiring soon for alert panel
    const warrantyAlerts = appliances
      .map(app => {
        const statusInfo = getWarrantyStatus(app.purchaseDate, app.warrantyMonths);
        return {
          appliance: app,
          statusInfo
        };
      })
      .filter(item => item.statusInfo.status === 'expiring_soon' || (item.statusInfo.status === 'expired' && item.statusInfo.daysRemaining >= -30)) // show expired within last 30 days
      .sort((a, b) => a.statusInfo.daysRemaining - b.statusInfo.daysRemaining);

    return {
      totalSpent,
      expiredWarranties,
      expiringSoonWarranties,
      activeWarranties,
      upcomingMaintenance,
      warrantyAlerts
    };
  }, [appliances, maintenanceLogs]);

  // Quick helper to view appliance from alert
  const handleViewApplianceFromAlert = (appId: string) => {
    const app = appliances.find(a => a.id === appId);
    if (app) onViewAppliance(app);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header section in Arabic */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/5 backdrop-blur-xl text-white rounded-[24px] p-6 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full border border-white/20 font-bold tracking-wide uppercase">مساعد الصيانة المنزلي</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">مرحباً بك في لوحة تحكّم الأجهزة</h1>
          <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed">
            تتبع مواعيد الصيانة الدورية للأجهزة المنزلية، واحصل على تنبيهات ذكية قبل انتهاء فترات الضمان لتوفير النفقات والحفاظ على سلامة منزلك.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-3 relative z-10 shrink-0">
          <button 
            type="button"
            onClick={onAddApplianceClick}
            className="flex items-center gap-2 bg-white text-slate-950 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition font-bold pointer-events-auto cursor-pointer shadow-lg"
          >
            <Plus className="w-5 h-5 text-slate-900" />
            <span>إضافة جهاز جديد</span>
          </button>
          
          <button 
            type="button"
            onClick={onAddLogClick}
            className="flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 py-2.5 rounded-xl hover:bg-white/15 transition font-bold pointer-events-auto cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-indigo-300" />
            <span>تسجيل صيانة</span>
          </button>
        </div>
      </div>

      {/* Grid of quick KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total appliances */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg hover:bg-white/10 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-bold">إجمالي الأجهزة</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/10">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{appliances.length}</span>
            <span className="text-xs text-white/40">أجهزة مسجلة</span>
          </div>
          <button 
            type="button"
            onClick={() => setActiveTab('appliances')}
            className="mt-4 text-xs text-indigo-300 font-bold hover:text-indigo-200 flex items-center gap-1 cursor-pointer pointer-events-auto"
          >
            <span>عرض كل الأجهزة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Maintenance cost summary */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg hover:bg-white/10 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-bold">مصاريف الصيانة</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/10">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalSpent}</span>
            <span className="text-xs text-white/40">ريال سعودي</span>
          </div>
          <button 
            type="button"
            onClick={() => setActiveTab('analytics')}
            className="mt-4 text-xs text-emerald-300 font-bold hover:text-emerald-200 flex items-center gap-1 cursor-pointer pointer-events-auto"
          >
            <span>عرض تحليلات التكاليف</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Warranties expiring soon */}
        <div className={`backdrop-blur-md rounded-2xl border p-5 shadow-lg hover:bg-white/10 transition duration-300 ${
          stats.expiringSoonWarranties > 0 ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/10 bg-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-bold">تنبيهات الضمان القريب</span>
            <div className={`p-2.5 rounded-xl ${
              stats.expiringSoonWarranties > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' : 'bg-white/5 text-white/60'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${
              stats.expiringSoonWarranties > 0 ? 'text-amber-400' : 'text-white'
            }`}>{stats.expiringSoonWarranties}</span>
            <span className="text-xs text-white/40">ينتهي خلال 60 يوماً</span>
          </div>
          <span className="mt-4 block text-xs text-white/50">
            {stats.expiredWarranties} ضمانات انتهت بالفعل
          </span>
        </div>

        {/* Active warranties */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg hover:bg-white/10 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-bold">الضمانات السارية</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.activeWarranties}</span>
            <span className="text-xs text-white/40">أجهزة تحت الضمان</span>
          </div>
          <span className="mt-4 block text-xs text-white/50">
            ضمانات نشطة وآمنة
          </span>
        </div>
      </div>

      {/* Main dashboard panels with alerts & schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Alerts & Reminders Section (Warranty & Upcoming Maintenance) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Warranty alerts panel */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-white text-base">تنبيهات حالة الضمان للأجهزة</h2>
              </div>
              <span className="text-xs bg-white/10 text-white/80 border border-white/10 px-2 py-1 rounded-md font-medium">تحديث فوري</span>
            </div>

            {stats.warrantyAlerts.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-white/20" />
                <p>جميع الضمانات بحالة ممتازة ومستقرة، لا توجد تنبيهات حالياً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.warrantyAlerts.map(item => {
                  const isExpired = item.statusInfo.status === 'expired';
                  return (
                    <div 
                      key={item.appliance.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition duration-300 hover:bg-white/5 ${
                        isExpired ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-rose-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
                          <h3 className="font-bold text-white text-sm hover:underline hover:text-indigo-200 cursor-pointer" onClick={() => onViewAppliance(item.appliance)}>
                            {item.appliance.name}
                          </h3>
                        </div>
                        <p className="text-xs text-white/50 ml-4">
                          الماركة: {item.appliance.brand} • الموقع: {item.appliance.location || 'غير محدد'}
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-0 flex items-center justify-between gap-4">
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isExpired ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {isExpired ? 'انتهى الضمان' : 'ينتهي الضمان قريباً'}
                          </span>
                          <p className="text-[11px] text-white/40 mt-1">
                            تاريخ الانتهاء: {formatDateString(item.statusInfo.expiryDateString)}
                          </p>
                        </div>
                        
                        <div className="shrink-0">
                          {isExpired ? (
                            <span className="text-rose-400 text-xs font-medium font-mono">
                              منذ {Math.abs(item.statusInfo.daysRemaining)} يوم
                            </span>
                          ) : (
                            <span className="text-amber-400 text-xs font-bold font-mono">
                              خلال {item.statusInfo.daysRemaining} يوم!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming preventative maintenance schedules */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white text-base">مواعيد صيانة قادمة وموصى بها</h2>
              </div>
              <span className="text-xs bg-white/10 text-white/80 border border-white/10 px-2 py-1 rounded-md font-medium">جدول زمني</span>
            </div>

            {stats.upcomingMaintenance.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm flex flex-col items-center justify-center gap-2">
                <Wrench className="w-8 h-8 text-white/20" />
                <p>لا توجد مواعيد صيانة قادمة مجدولة قريباً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingMaintenance.map(log => {
                  const isOverdue = log.daysUntil < 0;
                  return (
                    <div 
                      key={log.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition duration-300 hover:bg-white/5 ${
                        isOverdue ? 'bg-rose-500/10 border-rose-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">
                          {log.applianceName}
                        </h4>
                        <p className="text-xs text-white/55">
                          الوصف: {log.description.substring(0, 65)}...
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-start gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">
                            {formatDateString(log.nextMaintenanceDate!)}
                          </p>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            الموعد المقترح
                          </p>
                        </div>

                        <div>
                          {isOverdue ? (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] px-2.5 py-1 rounded-full font-bold">
                              متأخر منذ {Math.abs(log.daysUntil)} يوم
                            </span>
                          ) : (
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] px-2.5 py-1 rounded-full font-bold">
                              متبقي {log.daysUntil} يوم
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Informative advice / quick suggestions & app overview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Stats Distribution chart or visualization of appliances */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="font-semibold text-white text-base border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>نصائح الوقاية والصيانة المنزلية</span>
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 space-y-1">
                <span className="font-bold text-indigo-300 block text-sm">✓ نظف فلتر الغسالة والمجفف</span>
                <p className="text-white/60">تنظيف فلاتر الغسالة كل 3 أشهر يمنع انسداد مجرى المياه ويحمي محرك الغسالة من الضغط العالي.</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 space-y-1">
                <span className="font-bold text-amber-300 block text-sm">✓ صيانة مكيفات الهواء</span>
                <p className="text-white/60">غسيل فلتر التكييف شهرياً يوفر أكثر من 15% من استهلاك الكهرباء، ويطيل عمر ضاغط المكيف (الكومبريسور).</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 space-y-1">
                <span className="font-bold text-teal-300 block text-sm">✓ الفحص الدوري للأنابيب والصمامات</span>
                <p className="text-white/60">تصدّع جلود وتوصيلات المياه للأجهزة كالثلاجة وغسالة الصحون يسبب تلفاً كبيراً للأرضيات والأثاث دون انتباهك.</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/80 space-y-1">
                <span className="font-bold text-purple-300 block text-sm">✓ تسجيل تفاصيل الضمان بدقة</span>
                <p className="text-white/60">احتفظ بصور الفاتورة وشهادة الضمان في الحقل المخصص للرجوع إليها فور احتياجك للصيانة المجانية.</p>
              </div>
            </div>
          </div>

          {/* Quick status progress visualization */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="font-semibold text-white text-base mb-4">توزيع حالة الأجهزة والضمان</h2>
            {appliances.length === 0 ? (
              <p className="text-white/40 text-xs text-center">لا توجد بيانات كافية حالياً.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>تحت الضمان (ساري)</span>
                    <span className="font-bold text-white/90">{stats.activeWarranties} / {appliances.length}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(stats.activeWarranties / appliances.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>يوشك على الانتهاء</span>
                    <span className="font-bold text-white/90">{stats.expiringSoonWarranties} / {appliances.length}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(stats.expiringSoonWarranties / appliances.length) * 105}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>منتهي الضمان</span>
                    <span className="font-bold text-white/90">{stats.expiredWarranties} / {appliances.length}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(stats.expiredWarranties / appliances.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
