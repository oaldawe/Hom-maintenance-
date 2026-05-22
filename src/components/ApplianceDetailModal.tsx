import React, { useMemo } from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { getWarrantyStatus, formatDateString } from '../dateUtils';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../initialData';
import { 
  X, 
  MapPin, 
  Tag, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Coins, 
  Calendar, 
  User, 
  Phone,
  Wrench,
  FileText,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ApplianceDetailModalProps {
  appliance: Appliance | null;
  logs: MaintenanceLog[];
  onClose: () => void;
  onAddLog: (applianceId: string) => void;
  onDeleteLog: (logId: string) => void;
}

export default function ApplianceDetailModal({
  appliance,
  logs,
  onClose,
  onAddLog,
  onDeleteLog,
}: ApplianceDetailModalProps) {
  if (!appliance) return null;

  const warranty = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyMonths);
  const colorSchema = CATEGORY_COLORS[appliance.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[appliance.category] || CATEGORY_LABELS.other;

  // Filter logs for this specific appliance
  const applianceLogs = useMemo(() => {
    return logs
      .filter(log => log.applianceId === appliance.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, appliance.id]);

  // Aggregate total spent for this appliance
  const totalSpent = useMemo(() => {
    return applianceLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
  }, [applianceLogs]);

  // Next scheduled maintenance logs
  const upcomingMaintenanceLog = useMemo(() => {
    return applianceLogs.find(log => log.nextMaintenanceDate && new Date(log.nextMaintenanceDate) >= new Date());
  }, [applianceLogs]);

  const renderWarrantyBadge = () => {
    switch (warranty.status) {
      case 'valid':
        return (
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-bold">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
            <span>الضمان ساري ومغطى</span>
          </div>
        );
      case 'expiring_soon':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-bold animate-pulse">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
            <span>الضمان يوشك على الانتهاء!</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full font-bold">
            <ShieldX className="w-4.5 h-4.5 text-rose-600" />
            <span>الضمان منتهي الصلاحية</span>
          </div>
        );
    }
  };

  // Log types translating
  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'routine': return 'صيانة دورية وقائية';
      case 'repair': return 'إصلاح عطل مفاجئ';
      case 'cleaning': return 'تنظيف وغسيل';
      case 'spare_parts': return 'تغيير قطع غيار';
      default: return 'أخرى';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'repair': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'cleaning': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'spare_parts': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorSchema.bg} ${colorSchema.text}`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{appliance.name}</h2>
              <p className="text-xs text-slate-500">{appliance.brand} {appliance.model ? `• موديل ${appliance.model}` : ''}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition pointer-events-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Info Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status & Warranty card */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs text-slate-500 font-bold border-b border-slate-50 pb-2">فترة الضمان والصلاحية</h3>
              <div>{renderWarrantyBadge()}</div>
              <div className="text-xs space-y-1 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>تاريخ الشراء:</span>
                  <span className="font-semibold text-slate-800">{formatDateString(appliance.purchaseDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>مدة الضمان بالشهور:</span>
                  <span className="font-semibold text-slate-800">{appliance.warrantyMonths} شهراً</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ نهاية الضمان:</span>
                  <span className="font-bold text-indigo-700">{formatDateString(warranty.expiryDateString)}</span>
                </div>
                {warranty.status !== 'expired' && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>الوقت المتبقي لانتهاء الضمان:</span>
                    <span>{warranty.daysRemaining} يوم</span>
                  </div>
                )}
              </div>
            </div>

            {/* General Metadata Info card */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs text-slate-500 font-bold border-b border-slate-50 pb-2">تفاصيل وبيانات الجهاز</h3>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>القسم والمجموعة: {categoryLabel}</span>
                </div>
                {appliance.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>موقع الجهاز الحالي: {appliance.location}</span>
                  </div>
                )}
                {appliance.purchasePrice && (
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-slate-400" />
                    <span>سعر الشراء الأساسي: {appliance.purchasePrice} ريال سعودي</span>
                  </div>
                )}
                {appliance.serialNumber && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-400">الرقم التسلسلي (S/N):</span>
                    <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] tracking-wide">{appliance.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial & Next Schedule summary card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-800 text-white p-4 rounded-xl shadow-xs space-y-3">
              <h3 className="text-xs text-indigo-300 font-bold border-b border-indigo-950 pb-2">نظرة عامة على الصيانة</h3>
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-indigo-200">إجمالي النفقات:</span>
                  <div className="text-left">
                    <span className="text-2xl font-bold">{totalSpent}</span>
                    <span className="text-[10px] text-indigo-200 mr-1">ريال</span>
                  </div>
                </div>

                {upcomingMaintenanceLog && (
                  <div className="text-xs bg-indigo-850/60 p-2 rounded-lg border border-indigo-700/30">
                    <div className="flex items-center gap-1 text-indigo-300 font-semibold mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>موعد الصيانة القادم:</span>
                    </div>
                    <p className="font-bold text-white">{formatDateString(upcomingMaintenanceLog.nextMaintenanceDate!)}</p>
                    <p className="text-[10px] text-indigo-200 mt-1 line-clamp-1">{upcomingMaintenanceLog.description}</p>
                  </div>
                )}

                {!upcomingMaintenanceLog && (
                  <p className="text-[11px] text-slate-300 text-center py-2">
                    لا يوجد موعد مستقبلي مجدول
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes area if relevant */}
          {appliance.notes && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">📋 ملاحظات هامة:</span>
              <p className="leading-relaxed">{appliance.notes}</p>
            </div>
          )}

          {/* Historical Logs Listing Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">سجل الصيانة والعمليات ({applianceLogs.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => onAddLog(appliance.id)}
                className="flex items-center gap-1 text-xs text-white bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition font-medium pointer-events-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سجل صيانة</span>
              </button>
            </div>

            {applianceLogs.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-400">
                <FileText className="w-10 h-10 text-slate-300" />
                <p className="text-sm">لا توجد عمليات صيانة مسجلة حتى الآن لهذا الجهاز.</p>
                <p className="text-xs">سجل أول عملية صيانة الآن لتتبع التكاليف والحفاظ على فترات الضمان.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {applianceLogs.map((log) => (
                  <div key={log.id} className="relative pr-12 group">
                    {/* Time line badge dot */}
                    <div className="absolute right-3 top-3 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border-2 border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                      <Wrench className="w-3 h-3" />
                    </div>

                    {/* Log Details Container */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs transition duration-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Log Type Label */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getLogTypeColor(log.type)}`}>
                            {getLogTypeLabel(log.type)}
                          </span>
                          
                          {/* Cost Badge */}
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            التكلفة: {log.cost} ريال
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateString(log.date)}
                          </span>
                          
                          {/* Delete Action button for specific log */}
                          <button
                            type="button"
                            onClick={() => onDeleteLog(log.id)}
                            title="حذف هذا السجل"
                            className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition pointer-events-auto cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Log description */}
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{log.description}</p>

                      {/* Technician contact & details */}
                      {(log.technicianName || log.technicianPhone || log.nextMaintenanceDate) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500">
                          {log.technicianName && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">الفني: {log.technicianName}</span>
                            </div>
                          )}

                          {log.technicianPhone && (
                            <div className="flex items-center gap-1.5 min-w-0 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{log.technicianPhone}</span>
                            </div>
                          )}

                          {log.nextMaintenanceDate && (
                            <div className="flex items-center gap-1.5 min-w-0 text-indigo-700 font-semibold md:col-span-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">الصيانة القادمة: {formatDateString(log.nextMaintenanceDate)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold pointer-events-auto cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
