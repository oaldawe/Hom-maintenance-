import React, { useState, useMemo } from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { formatDateString } from '../dateUtils';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../initialData';
import { 
  Search, 
  Calendar, 
  Wrench, 
  Trash2, 
  User, 
  Phone, 
  Cpu, 
  Coins,
  ArrowUpDown
} from 'lucide-react';

interface MaintenanceTimelineProps {
  logs: MaintenanceLog[];
  appliances: Appliance[];
  onDeleteLog: (id: string) => void;
  onAddLog: () => void;
}

export default function MaintenanceTimeline({
  logs,
  appliances,
  onDeleteLog,
  onAddLog
}: MaintenanceTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplianceId, setSelectedApplianceId] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'cost-desc' | 'cost-asc'>('date-desc');

  // Appliance helper map
  const appliancesMap = useMemo(() => {
    return appliances.reduce((acc, app) => {
      acc[app.id] = app;
      return acc;
    }, {} as Record<string, Appliance>);
  }, [appliances]);

  // Log types translating
  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'routine': return 'صيانة دورية';
      case 'repair': return 'إصلاح عطل';
      case 'cleaning': return 'تنظيف وغسيل';
      case 'spare_parts': return 'قطع غيار';
      default: return 'أخرى';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-blue-505/20 text-blue-300 border border-blue-500/25';
      case 'repair': return 'bg-rose-500/20 text-rose-300 border border-rose-500/25';
      case 'cleaning': return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25';
      case 'spare_parts': return 'bg-purple-500/20 text-purple-300 border border-purple-500/25';
      default: return 'bg-white/10 text-white/80';
    }
  };

  // Filtered Logs
  const filteredAndSortedLogs = useMemo(() => {
    let result = [...logs];

    // Filter by Search term (description, technician, device name)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(log => {
        const appName = appliancesMap[log.applianceId]?.name.toLowerCase() || '';
        const desc = log.description.toLowerCase();
        const tech = log.technicianName?.toLowerCase() || '';
        return appName.includes(q) || desc.includes(q) || tech.includes(q);
      });
    }

    // Filter by Appliance
    if (selectedApplianceId !== 'all') {
      result = result.filter(log => log.applianceId === selectedApplianceId);
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(log => log.type === selectedType);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'cost-desc') {
        return b.cost - a.cost;
      }
      if (sortBy === 'cost-asc') {
        return a.cost - b.cost;
      }
      return 0;
    });

    return result;
  }, [logs, searchTerm, selectedApplianceId, selectedType, sortBy, appliancesMap]);

  // Total spent in this filtered result
  const filteredTotalCost = useMemo(() => {
    return filteredAndSortedLogs.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  }, [filteredAndSortedLogs]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Search and Filters Strip */}
      <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>أرشيف وسجلات مواعيد الصيانة المنفذة</span>
            </h2>
            <p className="text-xs text-white/55">تابع المواعيد والتكاليف وأرقام الفنيين في سجل زمني موحد.</p>
          </div>
          <button
            type="button"
            onClick={onAddLog}
            className="flex items-center gap-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 px-4 py-2 rounded-xl font-bold pointer-events-auto cursor-pointer self-stretch sm:self-auto shadow-lg"
          >
            <Wrench className="w-4 h-4" />
            <span>تسجيل عملية صيانة جديدة</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالوصف، اسم الفني أو الجهاز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pr-9 pl-3 py-2 bg-white/5 text-white placeholder-white/45 border border-white/10 rounded-xl focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/40" />
          </div>

          {/* Filter by Appliance */}
          <div>
            <select
              value={selectedApplianceId}
              onChange={(e) => setSelectedApplianceId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-slate-900 text-white/95 focus:outline-hidden focus:border-indigo-400"
            >
              <option value="all">جميع الأجهزة المنزلية</option>
              {appliances.map(app => (
                <option key={app.id} value={app.id} className="bg-slate-900 text-white">{app.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-slate-900 text-white/95 focus:outline-hidden focus:border-indigo-400"
            >
              <option value="all">جميع تصنيفات الصيانة</option>
              <option value="routine" className="bg-slate-900 text-white">صيانة دورية</option>
              <option value="repair" className="bg-slate-900 text-white">إصلاح عطل</option>
              <option value="cleaning" className="bg-slate-900 text-white">تنظيف وغسيل</option>
              <option value="spare_parts" className="bg-slate-900 text-white">قطع غيار جديدة</option>
            </select>
          </div>

          {/* Sort By options */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-slate-900 text-white/95 focus:outline-hidden focus:border-indigo-400"
            >
              <option value="date-desc" className="bg-slate-900 text-white">التاريخ (الأحدث أولاً)</option>
              <option value="date-asc" className="bg-slate-900 text-white">التاريخ (الأقدم أولاً)</option>
              <option value="cost-desc" className="bg-slate-900 text-white">التكلفة (الأعلى أولاً)</option>
              <option value="cost-asc" className="bg-slate-900 text-white">التكلفة (الأقل أولاً)</option>
            </select>
          </div>
        </div>

        {/* Expenses Indicator in Filters Footer */}
        <div className="flex items-center gap-2 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/15 text-xs">
          <Coins className="w-4 h-4 text-indigo-300 shrink-0" />
          <span className="text-white/70">إجمالي نفقات البحث الحالي:</span>
          <span className="font-extrabold text-white">{filteredTotalCost} ريال سعودي</span>
          <span className="text-[10px] text-white/45 mr-auto">({filteredAndSortedLogs.length} عمليات صيانة)</span>
        </div>
      </div>

      {/* Actual Timeline Content */}
      {filteredAndSortedLogs.length === 0 ? (
        <div className="bg-white/5 py-16 text-center rounded-2xl border border-white/10 shadow-lg flex flex-col items-center justify-center gap-3">
          <div className="p-4 bg-white/10 text-white/50 rounded-full">
            <Search className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="font-bold text-white text-sm">لا توجد عمليات صيانة تطابق المعايير</h3>
          <p className="text-xs text-white/55 max-w-sm px-6 leading-relaxed">حاول تغيير تصنيفات البحث والفرشاة أو تصفية الأجهزة للوصول للسجل المنسق.</p>
        </div>
      ) : (
        <div className="relative before:absolute before:right-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
          <div className="space-y-6">
            {filteredAndSortedLogs.map((log) => {
              const targetApp = appliancesMap[log.applianceId];
              return (
                <div key={log.id} className="relative pr-14 group">
                  {/* Timeline Badge Dot */}
                  <div className="absolute right-2.5 top-2 w-7 h-7 rounded-full bg-white/10 border-2 border-white/15 text-indigo-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition duration-300 z-10 shadow-lg">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>

                  {/* Main card box */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/15 hover:shadow-2xl transition duration-300 space-y-4">
                    
                    {/* Log Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            className="text-sm font-bold text-white"
                          >
                            {targetApp ? targetApp.name : 'جهاز غير معروف أو محذوف'}
                          </h3>
                          {targetApp && (
                            <span className="text-[10px] bg-white/10 text-white/80 border border-white/10 px-2 py-0.5 rounded-md">
                              {targetApp.brand}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-white/30" />
                          <span>الموقع: {targetApp?.location || 'غير محدد'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {/* Cost Badge */}
                        <div className="text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/15 px-3 py-1 rounded-xl">
                          {log.cost} ريال
                        </div>

                        {/* Date badge */}
                        <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-xl border border-white/10 font-mono">
                          {formatDateString(log.date)}
                        </div>

                        {/* Delete single log */}
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          title="حذف القيد"
                          className="p-1 text-white/30 hover:text-rose-400 hover:bg-white/10 rounded-lg transition duration-200 pointer-events-auto cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline Log body text */}
                    <div className="text-xs text-white/85 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-200 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getLogTypeColor(log.type).split(' ')[1]}`}></span>
                        <span>{getLogTypeLabel(log.type)}:</span>
                      </div>
                      <p className="font-sans text-white/90">{log.description}</p>
                    </div>

                    {/* Contacts & Scheduled info */}
                    {(log.technicianName || log.technicianPhone || log.nextMaintenanceDate) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-1">
                        {log.technicianName && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-white/40" />
                            <span>الفني: {log.technicianName}</span>
                          </div>
                        )}
                        {log.technicianPhone && (
                          <div className="flex items-center gap-1.5 font-mono" dir="ltr">
                            <Phone className="w-4 h-4 text-white/40" />
                            <span>{log.technicianPhone}</span>
                          </div>
                        )}
                        {log.nextMaintenanceDate && (
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold mr-auto">
                            <Calendar className="w-4 h-4 text-indigo-400 animate-pulse" />
                            <span>الصيانة القادمة الموصى بها: {formatDateString(log.nextMaintenanceDate)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
