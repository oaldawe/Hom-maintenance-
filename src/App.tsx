import React, { useState, useEffect, useMemo } from 'react';
import { Appliance, MaintenanceLog } from './types';
import { INITIAL_APPLIANCES, INITIAL_MAINTENANCE_LOGS, CATEGORY_LABELS } from './initialData';
import { getWarrantyStatus } from './dateUtils';

// Import subcomponents
import Dashboard from './components/Dashboard';
import ApplianceCard from './components/ApplianceCard';
import ApplianceDetailModal from './components/ApplianceDetailModal';
import ApplianceFormModal from './components/ApplianceFormModal';
import MaintenanceFormModal from './components/MaintenanceFormModal';
import MaintenanceTimeline from './components/MaintenanceTimeline';
import AnalyticsView from './components/AnalyticsView';

// Icons
import { 
  Home, 
  Cpu, 
  Calendar, 
  LineChart, 
  Plus, 
  Wrench, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    const local = localStorage.getItem('sianah_appliances');
    return local ? JSON.parse(local) : INITIAL_APPLIANCES;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const local = localStorage.getItem('sianah_maintenance_logs');
    return local ? JSON.parse(local) : INITIAL_MAINTENANCE_LOGS;
  });

  // --- Navigation & Filter States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appliances' | 'logs' | 'analytics'>('dashboard');
  const [applianceSearchTerm, setApplianceSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedWarrantyFilter, setSelectedWarrantyFilter] = useState('all');

  // --- Modal Open States ---
  const [selectedApplianceDetail, setSelectedApplianceDetail] = useState<Appliance | null>(null);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [applianceToEdit, setApplianceToEdit] = useState<Appliance | null>(null);
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [preSelectedApplianceForLog, setPreSelectedApplianceForLog] = useState<string | null>(null);

  // --- Temporary Toast Notification ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('sianah_appliances', JSON.stringify(appliances));
  }, [appliances]);

  useEffect(() => {
    localStorage.setItem('sianah_maintenance_logs', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  // Show quick notification
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- State Actions & Handlers ---

  // Create or Update Appliance
  const handleSaveAppliance = (data: Omit<Appliance, 'id'> & { id?: string }) => {
    if (data.id) {
      // Editing
      setAppliances(prev => prev.map(app => app.id === data.id ? { ...app, ...data } as Appliance : app));
      showToast('تم تحديث بيانات الجهاز بنجاح 🛠️');
      
      // Update selected detail if currently viewing this appliance
      if (selectedApplianceDetail && selectedApplianceDetail.id === data.id) {
        setSelectedApplianceDetail({ ...selectedApplianceDetail, ...data } as Appliance);
      }
    } else {
      // Creating new
      const newAppliance: Appliance = {
        ...data,
        id: `app-${Date.now()}`
      };
      setAppliances(prev => [newAppliance, ...prev]);
      showToast('تمت إضافة الجهاز المنزلي الجديد لقائمتك 🎉');
    }
    
    // Close modal
    setIsApplianceFormOpen(false);
    setApplianceToEdit(null);
  };

  // Delete Appliance & its maintenance logs
  const handleDeleteAppliance = (appId: string) => {
    const targetApp = appliances.find(a => a.id === appId);
    if (!targetApp) return;

    if (window.confirm(`هل أنت متأكد من رغبتك في حذف جهاز "${targetApp.name}"؟ سيؤدي ذلك أيضاً لحذف كافة سجلات الصيانة التابعة له.`)) {
      setAppliances(prev => prev.filter(app => app.id !== appId));
      setMaintenanceLogs(prev => prev.filter(log => log.applianceId !== appId));
      
      // Close detail modal if currently viewing this deleted app
      if (selectedApplianceDetail && selectedApplianceDetail.id === appId) {
        setSelectedApplianceDetail(null);
      }

      showToast('تم حذف الجهاز وسجلاته بنجاح 🗑️');
    }
  };

  // Save new maintenance log
  const handleSaveMaintenanceLog = (data: Omit<MaintenanceLog, 'id'>) => {
    const newLog: MaintenanceLog = {
      ...data,
      id: `log-${Date.now()}`
    };
    setMaintenanceLogs(prev => [newLog, ...prev]);

    const targetApp = appliances.find(a => a.id === data.applianceId);
    showToast(`تم تسجيل صيانة "${targetApp?.name || 'الجهاز'}" بنجاح 🪙`);
    
    setIsMaintenanceFormOpen(false);
    setPreSelectedApplianceForLog(null);
  };

  // Delete maintenance log
  const handleDeleteMaintenanceLog = (logId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف سجل الصيانة المحدد؟')) {
      setMaintenanceLogs(prev => prev.filter(log => log.id !== logId));
      showToast('تم حذف قيد الصيانة المحدد 🗑️');
    }
  };

  // Open Edit Appliance Modal
  const startEditAppliance = (appliance: Appliance) => {
    setApplianceToEdit(appliance);
    setIsApplianceFormOpen(true);
  };

  // Open Log maintenance modal for specific appliance
  const startMaintenanceLogForAppliance = (applianceId: string) => {
    setPreSelectedApplianceForLog(applianceId);
    setIsMaintenanceFormOpen(true);
  };

  // Open General Maintenance Log
  const startGeneralMaintenanceLog = () => {
    setPreSelectedApplianceForLog(null);
    setIsMaintenanceFormOpen(true);
  };

  // Reset demo data
  const handleResetToDefault = () => {
    if (window.confirm('هل تود استعادة البيانات التجريبية الأولية؟ سيقوم ذلك بمسح التعديلات الحالية.')) {
      setAppliances(INITIAL_APPLIANCES);
      setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
      showToast('تمت استعادة البيانات الافتراضية بنجاح 🔧', 'info');
    }
  };

  // --- Computed Appliance filter lists ---
  const filteredAppliances = useMemo(() => {
    return appliances.filter(app => {
      // 1. Category search
      if (selectedCategoryFilter !== 'all' && app.category !== selectedCategoryFilter) {
        return false;
      }

      // 2. Warranty Status
      const statusInfo = getWarrantyStatus(app.purchaseDate, app.warrantyMonths);
      if (selectedWarrantyFilter !== 'all' && statusInfo.status !== selectedWarrantyFilter) {
        return false;
      }

      // 3. Text search (Name, Model, Brand)
      if (applianceSearchTerm.trim()) {
        const query = applianceSearchTerm.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(query);
        const matchesBrand = app.brand.toLowerCase().includes(query);
        const matchesModel = app.model?.toLowerCase().includes(query) || false;
        
        return matchesName || matchesBrand || matchesModel;
      }

      return true;
    });
  }, [appliances, selectedCategoryFilter, selectedWarrantyFilter, applianceSearchTerm]);

  // Aggregate stats of warranties expiring soon to show a navbar counter
  const expiringSoonCount = useMemo(() => {
    return appliances.filter(app => {
      const info = getWarrantyStatus(app.purchaseDate, app.warrantyMonths);
      return info.status === 'expiring_soon';
    }).length;
  }, [appliances]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden pb-12" dir="rtl">
      
      {/* Ambient glowing circles behind the frosted glass app container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[130px] opacity-[0.25]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600 rounded-full blur-[130px] opacity-[0.20]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500 rounded-full blur-[150px] opacity-10"></div>
      </div>

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          <button onClick={() => setToast(null)} className="mr-auto hover:text-slate-300">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        
        {/* Central Frosted Glass Window */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl sm:rounded-[36px] shadow-2xl p-5 sm:p-8 flex flex-col gap-6">

          {/* Navigation & Brand Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 text-white rounded-2xl border border-white/25 shadow-lg hover:rotate-6 transition duration-300">
                <Wrench className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚙️</span>
                  <h1 className="text-lg font-black tracking-tight text-white">مُنبّه الصيانة المنزلي والضمان</h1>
                </div>
                <p className="text-xs text-white/60 font-medium">إدارة فترات ضمان الأجهزة وجدولة عمليات الصيانة الوقائية.</p>
              </div>
            </div>

            {/* Tab Selection Navigation */}
            <nav className="flex flex-wrap items-center bg-white/5 p-1.5 rounded-xl border border-white/10 text-xs font-bold gap-1 self-stretch md:self-auto backdrop-blur-md">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition pointer-events-auto cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => setActiveTab('appliances')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition pointer-events-auto cursor-pointer ${
                  activeTab === 'appliances' 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>الأجهزة المنزلية</span>
                {expiringSoonCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                    {expiringSoonCount} تنبيه
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition pointer-events-auto cursor-pointer ${
                  activeTab === 'logs' 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>سجلات الصيانة</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition pointer-events-auto cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <LineChart className="w-4 h-4" />
                <span>التحليلات المالية</span>
              </button>
            </nav>

          </header>

          {/* Tab Router Switch */}
          <main className="space-y-6">

          {/* TAB 1: Dashboard View */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              appliances={appliances}
              maintenanceLogs={maintenanceLogs}
              onAddApplianceClick={() => {
                setApplianceToEdit(null);
                setIsApplianceFormOpen(true);
              }}
              onAddLogClick={startGeneralMaintenanceLog}
              onViewAppliance={(app) => setSelectedApplianceDetail(app)}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 2: Grid of appliances list */}
          {activeTab === 'appliances' && (
            <div className="space-y-6">
              
              {/* Header inside the appliances section */}
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-300" />
                      <span>قائمة الأجهزة المنزلية المسجلة</span>
                    </h2>
                    <p className="text-xs text-white/50">تحكّم بكافة الأجهزة وراقب تواريخ انتهاء عقد الضمان.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setApplianceToEdit(null);
                      setIsApplianceFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 text-xs text-slate-950 bg-white hover:bg-slate-100 border border-white/10 px-4 py-2.5 rounded-xl font-bold pointer-events-auto cursor-pointer self-stretch sm:self-auto shadow-md transition"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>إضافة جهاز جديد</span>
                  </button>
                </div>

                {/* Filter and search parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Search box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث بالاسم، الموديل أو الماركة..."
                      value={applianceSearchTerm}
                      onChange={(e) => setApplianceSearchTerm(e.target.value)}
                      className="w-full text-xs pr-9 pl-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/45 rounded-xl focus:outline-hidden focus:bg-white/10 focus:border-white/30"
                    />
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/40" />
                  </div>

                  {/* Category select filter */}
                  <div>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl focus:outline-hidden focus:border-white/30"
                    >
                      <option value="all">الأقسام: جميع الأجهزة</option>
                      <option value="kitchen">أجهزة المطبخ</option>
                      <option value="laundry">أجهزة الغسيل</option>
                      <option value="ac">التكييف والتهوية</option>
                      <option value="cleaning">أجهزة التنظيف</option>
                      <option value="entertainment">الترفيه الشاشات</option>
                      <option value="other">أجهزة أخرى</option>
                    </select>
                  </div>

                  {/* Warranty filter selection */}
                  <div>
                    <select
                      value={selectedWarrantyFilter}
                      onChange={(e) => setSelectedWarrantyFilter(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-xl focus:outline-hidden focus:border-white/30"
                    >
                      <option value="all">حالة الضمان: الكل</option>
                      <option value="valid">ضمان ساري ونشط</option>
                      <option value="expiring_soon">يوشك على الانتهاء</option>
                      <option value="expired">ضمان منتهي</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid block displaying filtered items */}
              {filteredAppliances.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-md py-16 text-center rounded-2xl border border-white/10 shadow-lg flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-white/5 text-white/30 rounded-full">
                    <Cpu className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="font-bold text-white text-sm">لا تتوفر أجهزة مطابقة لخيارات الفرز الحالية</h3>
                  <p className="text-xs text-white/40 max-w-sm">جرب ضبط كلمات البحث أو تعديل تصنيفات تصفية الضمان والأقسام.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAppliances.map((app) => {
                    // Get latest log for this appliance
                    const latestLog = maintenanceLogs
                      .filter(log => log.applianceId === app.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                    return (
                      <ApplianceCard 
                        key={app.id}
                        appliance={app}
                        latestLog={latestLog}
                        onView={(target) => setSelectedApplianceDetail(target)}
                        onEdit={startEditAppliance}
                        onDelete={handleDeleteAppliance}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Maintenance Timeline logs list */}
          {activeTab === 'logs' && (
            <MaintenanceTimeline 
              logs={maintenanceLogs}
              appliances={appliances}
              onDeleteLog={handleDeleteMaintenanceLog}
              onAddLog={startGeneralMaintenanceLog}
            />
          )}

          {/* TAB 4: Analytics Graphs and Cost Distribution */}
          {activeTab === 'analytics' && (
            <AnalyticsView 
              appliances={appliances}
              logs={maintenanceLogs}
            />
          )}

        </main>

        {/* Option to clear local storage and start clean or restore preloaded data */}
        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>
            <span>تتبع صيانة الأجهزة والضمان المنزلية • تم التطوير بإتقان</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleResetToDefault}
              className="text-white/60 hover:text-white hover:underline transition pointer-events-auto cursor-pointer font-medium"
            >
              🔄 استعادة البيانات التوضيحية الافتراضية
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (window.confirm(' هل تود مسح كامل البيانات المسجلة والبدء بصفحة فارغة تماماً؟ لا يمكن التراجع عن هذا الإجراء.')) {
                  setAppliances([]);
                  setMaintenanceLogs([]);
                  showToast('تمت تهيئة ومسح كامل البيانات بنجاح ✔️', 'info');
                }
              }}
              className="text-rose-400 hover:text-rose-300 hover:underline transition pointer-events-auto cursor-pointer font-bold"
            >
              ⚠️ مسح كامل البيانات والتصنيع
            </button>
          </div>
        </footer>

        </div> {/* Close central frosted board */}

      </div>

      {/* --- MOUNTED DIALOG MODALS --- */}

      {/* 1. Appliance Details and History Modal */}
      {selectedApplianceDetail && (
        <ApplianceDetailModal 
          appliance={selectedApplianceDetail}
          logs={maintenanceLogs}
          onClose={() => setSelectedApplianceDetail(null)}
          onAddLog={startMaintenanceLogForAppliance}
          onDeleteLog={handleDeleteMaintenanceLog}
        />
      )}

      {/* 2. Create/Edit Appliance Modal */}
      {isApplianceFormOpen && (
        <ApplianceFormModal 
          appliance={applianceToEdit}
          onClose={() => {
            setIsApplianceFormOpen(false);
            setApplianceToEdit(null);
          }}
          onSave={handleSaveAppliance}
        />
      )}

      {/* 3. Register Maintenance Log Modal */}
      {isMaintenanceFormOpen && (
        <MaintenanceFormModal 
          appliances={appliances}
          preSelectedApplianceId={preSelectedApplianceForLog}
          onClose={() => {
            setIsMaintenanceFormOpen(false);
            setPreSelectedApplianceForLog(null);
          }}
          onSave={handleSaveMaintenanceLog}
        />
      )}

    </div>
  );
}
