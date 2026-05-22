import React, { useState, useEffect } from 'react';
import { Appliance } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface ApplianceFormModalProps {
  appliance: Appliance | null; // null if adding new, existing if editing
  onClose: () => void;
  onSave: (data: Omit<Appliance, 'id'> & { id?: string }) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'kitchen', label: 'أجهزة المطبخ (ثلاجة، فرن، ميكروويف)' },
  { value: 'laundry', label: 'أجهزة الغسيل (غسالة، مجفف، كاوية)' },
  { value: 'ac', label: 'التكييف والتهوية (سبليت، مركزي، شباك)' },
  { value: 'cleaning', label: 'أجهزة التنظيف (مكنسة كهربائية، ممسحة)' },
  { value: 'entertainment', label: 'الترفيه والشاشات (تلفاز، مسرح منزلي)' },
  { value: 'other', label: 'أجهزة أخرى متفرقة' }
];

const LOCATION_SUGGESTIONS = [
  'المطبخ الرئيسي',
  'غرفة الغسيل',
  'الصالة الرئيسية',
  'غرفة المعيشة',
  'المجلس',
  'غرفة النوم الرئيسية',
  'مستودع المنزل',
  'الحمام'
];

const WARRANTY_SUGGESTIONS = [
  { value: 12, label: 'سنة واحدة (12 شهراً)' },
  { value: 24, label: 'سنتان (24 شهراً)' },
  { value: 36, label: '3 سنوات (36 شهراً)' },
  { value: 60, label: '5 سنوات (60 شهراً)' },
  { value: 120, label: '10 سنوات (120 شهراً - مثل الكومبريسور)' },
  { value: 0, label: 'بدون ضمان (0 شهور)' }
];

export default function ApplianceFormModal({
  appliance,
  onClose,
  onSave
}: ApplianceFormModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<Appliance['category']>('kitchen');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-populate if editing
  useEffect(() => {
    if (appliance) {
      setName(appliance.name || '');
      setBrand(appliance.brand || '');
      setModel(appliance.model || '');
      setSerialNumber(appliance.serialNumber || '');
      setCategory(appliance.category || 'kitchen');
      setPurchaseDate(appliance.purchaseDate || '');
      setWarrantyMonths(appliance.warrantyMonths ?? 24);
      setPurchasePrice(appliance.purchasePrice ?? '');
      setLocation(appliance.location || '');
      setNotes(appliance.notes || '');
    } else {
      // Set default purchase date to today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setPurchaseDate(`${year}-${month}-${day}`);
    }
  }, [appliance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Simplest validation
    if (!name.trim()) {
      setErrorMsg('فضلاً أدخل اسم الجهاز أو مسمى توضيحي (مثال: غسالة الصحون الرئيسية)');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('فضلاً أدخل الشركة المصنعة للمنتج (مثال: سامسونج، إل جي)');
      return;
    }
    if (!purchaseDate) {
      setErrorMsg('فضلاً حدد تاريخ الشراء لحساب فترات الضمان بدقة');
      return;
    }
    if (warrantyMonths < 0) {
      setErrorMsg('مدة الضمان لا يمكن أن تكون قيمة سالبة');
      return;
    }

    onSave({
      id: appliance?.id, // Includes ID if editing
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      category,
      purchaseDate,
      warrantyMonths: Number(warrantyMonths),
      purchasePrice: purchasePrice !== '' ? Number(purchasePrice) : undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-950">
            {appliance ? '✏️ تعديل بيانات الجهاز المنزلي' : '🔌 إضافة جهاز منزلي جديد'}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition pointer-events-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Device name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">مسمى الجهاز <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="مثال: ثلاجة المطبخ، غسالة الصحون"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الشركة المصنعة / الماركة <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="مثال: سامسونج، إل جي، بوش"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Category & Purchase Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تصنيف وقسم الجهاز <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Appliance['category'])}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-600"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">سعر الشراء (ريال سعودي - اختياري)</label>
              <input
                type="number"
                placeholder="مثال: 3200"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                min="0"
              />
            </div>
          </div>

          {/* Purchase Date & Warranty Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تاريخ الشراء <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">مدة الضمان (شهراً) <span className="text-rose-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="مثال: 24"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-24 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                  min="0"
                />
                
                {/* Quick select dropdown */}
                <select
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="flex-1 text-xs px-2 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-600"
                  defaultValue="24"
                >
                  <option value="">-- فترات شائعة --</option>
                  {WARRANTY_SUGGESTIONS.map(term => (
                    <option key={term.value} value={term.value}>{term.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Model & Serial number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم الموديل (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: WA80H4000"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الرقم التسلسلي S/N (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: SN-5542-F23"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">موقع الجهاز في المنزل (اختياري)</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="مثال: المطبخ الدور الأول، الصالة"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
              />
              
              {/* Quick pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LOCATION_SUGGESTIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[10px] bg-slate-50 hover:bg-indigo-5 text-slate-600 hover:text-indigo-800 px-2.5 py-1 rounded-md border border-slate-100 hover:border-indigo-100 transition pointer-events-auto cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments/Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ملاحظات إضافية (اختياري)</label>
            <textarea
              placeholder="مثال: تفاصيل عن الوكيل المحلي، توصيات تشغيل دورية، ملفات الضمان..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 h-20 resize-none"
            ></textarea>
          </div>

          {/* Form Actions footer */}
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
              <span>{appliance ? 'حفظ التعديلات' : 'إضافة الجهاز'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
