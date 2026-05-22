import React, { useState, useEffect } from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface MaintenanceFormModalProps {
  appliances: Appliance[];
  preSelectedApplianceId: string | null;
  onClose: () => void;
  onSave: (data: Omit<MaintenanceLog, 'id'>) => void;
}

const TYPE_OPTIONS = [
  { value: 'routine', label: '🛠️ صيانة دورية وقائية (تنظيف، فحص مستمر)' },
  { value: 'repair', label: '🚨 إصلاح عطل độtائي (حل مشكلة مفاجئة)' },
  { value: 'cleaning', label: '✨ تنظيف وغسيل (فلاتر ومجاري تصريف)' },
  { value: 'spare_parts', label: '⚙️ تركيب قطع غيار جديدة أصلية' }
];

export default function MaintenanceFormModal({
  appliances,
  preSelectedApplianceId,
  onClose,
  onSave
}: MaintenanceFormModalProps) {
  const [applianceId, setApplianceId] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [type, setType] = useState<MaintenanceLog['type']>('routine');
  const [description, setDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [technicianPhone, setTechnicianPhone] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-populate date selection to today and appliance selection if provided
  useEffect(() => {
    // Current date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);

    if (preSelectedApplianceId) {
      setApplianceId(preSelectedApplianceId);
    } else if (appliances.length > 0) {
      setApplianceId(appliances[0].id);
    }
  }, [preSelectedApplianceId, appliances]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applianceId) {
      setErrorMsg('فضلاً اختر الجهاز المعني بالصيانة');
      return;
    }
    if (!date) {
      setErrorMsg('فضلاً اختر تاريخ إجراء الصيانة');
      return;
    }
    if (cost === '' || Number(cost) < 0) {
      setErrorMsg('فضلاً حدد التكلفة المالية بالريال (ضع 0 للصيانات المجانية أو التي تشمل الضمان)');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('فضلاً اكتب وصفاً لعملية الصيانة والتفاصيل والقطع المستبدلة للرجوع إليها مستقبلاً');
      return;
    }

    onSave({
      applianceId,
      date,
      cost: Number(cost),
      type,
      description: description.trim(),
      technicianName: technicianName.trim() || undefined,
      technicianPhone: technicianPhone.trim() || undefined,
      nextMaintenanceDate: nextMaintenanceDate || undefined,
      status: 'completed'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Main Form container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-950">📋 تسجيل عملية صيانة جديدة</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition pointer-events-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Appliance & Maintenance type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">اختر الجهاز المعني بالصيانة <span className="text-rose-500">*</span></label>
              {preSelectedApplianceId ? (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-900">
                  {appliances.find(a => a.id === preSelectedApplianceId)?.name || 'جهاز محدد'}
                </div>
              ) : (
                <select
                  value={applianceId}
                  onChange={(e) => setApplianceId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-600"
                >
                  {appliances.length === 0 ? (
                    <option value="">لا توجد أجهزة مضافة حالياً</option>
                  ) : (
                    appliances.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.brand})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نوع العملية والتصنيف <span className="text-rose-500">*</span></label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceLog['type'])}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-600"
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Maintenance Date & Maintenance Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تاريخ إجراء الصيانة <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تكلفة الصيانة (بالريال - ضع 0 للضمان/المجاني) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                placeholder="مثال: 150"
                value={cost}
                onChange={(e) => setCost(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                min="0"
              />
            </div>
          </div>

          {/* Detailed description of the maintenance activity */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">تفاصيل الصيانة ووصف العمل <span className="text-rose-500">*</span></label>
            <textarea
              placeholder="اكتب بالتفصيل المشكلة التي تم حلها، القطع المستبدلة والملاحظات (مثال: تغيير الفلاتر الداخلية، تعبئة غاز الفريون، حل مشكلة تسرب المياه...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 h-24 resize-none font-sans"
            ></textarea>
          </div>

          {/* Technician Name & Technician Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">اسم الفني أو ورشة الصيانة (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: م. أحمد الدوسري، الورشة المتحدة"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم جوال الفني / الورشة (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: 05XXXXXXXX"
                value={technicianPhone}
                onChange={(e) => setTechnicianPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-left font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Recommended next maintenance date (Crucial for maintenance scheduling and alarms) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-indigo-900 flex items-center gap-1">
              ⏰ موعد الصيانة القادم المقترح (جدولة تذكير - اختياري)
            </label>
            <input
              type="date"
              value={nextMaintenanceDate}
              onChange={(e) => setNextMaintenanceDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-indigo-100 hover:border-indigo-200 focus:outline-hidden focus:border-indigo-600 bg-indigo-50/20"
            />
            <p className="text-[10px] text-slate-400">
              سيقوم التطبيق بتنبيهك وجدولة هذا الموعد تلقائياً في لوحة التحكم عند اقترابه للمحافظة على كفاءة الجهاز.
            </p>
          </div>

          {/* Form action footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold pointer-events-auto cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="text-xs flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-505 border border-indigo-500 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold pointer-events-auto cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>تسجيل وإضافة الصيانة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
