import { Appliance, MaintenanceLog } from './types';

export const CATEGORY_LABELS: Record<string, string> = {
  kitchen: 'أجهزة المطبخ',
  laundry: 'أجهزة الغسيل',
  ac: 'التكييف والتهوية',
  cleaning: 'أجهزة التنظيف',
  entertainment: 'الترفيه الشاشات',
  other: 'أجهزة أخرى',
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  kitchen: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  laundry: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ac: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  cleaning: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  entertainment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export const INITIAL_APPLIANCES: Appliance[] = [
  {
    id: 'app-1',
    name: 'ثلاجة سامسونج ذكية 22 قدم',
    brand: 'سامسونج (Samsung)',
    category: 'kitchen',
    model: 'RT53K6257UT',
    serialNumber: 'SN-9823482349-K',
    purchaseDate: '2024-06-15', // Expires 2026-06-15 (Today: 2026-05-22, expiring soon!)
    warrantyMonths: 24,
    purchasePrice: 4200,
    location: 'المطبخ الرئيسي',
    notes: 'تحتوي على خاصية التبريد الثنائي والتوفير الذكي للطاقة.',
  },
  {
    id: 'app-2',
    name: 'غسالة ملابس إل جي 9 كيلو فتحة أمامية',
    brand: 'إل جي (LG)',
    category: 'laundry',
    model: 'F4J6VYG0W',
    serialNumber: 'LG-WS-99214A',
    purchaseDate: '2024-11-10', // Expires 2026-11-10 (Active/Valid)
    warrantyMonths: 24,
    purchasePrice: 3100,
    location: 'غرفة الغسيل',
    notes: 'محرك الدفع المباشر، يجب تنظيف فلتر التصريف كل 3 أشهر.',
  },
  {
    id: 'app-3',
    name: 'مكيف سبليت جري بولار 18 ألف وحدة',
    brand: 'جري (Gree)',
    category: 'ac',
    model: 'GWC18AGD',
    serialNumber: 'GR-AC-2023-45B',
    purchaseDate: '2023-04-12', // Expires 2025-04-12 (Expired)
    warrantyMonths: 24,
    purchasePrice: 2450,
    location: 'غرفة المعيشة',
    notes: 'تحتاج لتنظيف الفلاتر شهرياً وصيانة دورية قبل موسم الصيف.',
  },
  {
    id: 'app-4',
    name: 'مكنسة دايسون اللاسلكية V15',
    brand: 'دايسون (Dyson)',
    category: 'cleaning',
    model: 'Dyson V15 Detect',
    serialNumber: 'DY-V15-4428-A',
    purchaseDate: '2025-02-18', // Expires 2027-02-18 (Active/Valid)
    warrantyMonths: 24,
    purchasePrice: 2899,
    location: 'مخزن الدور الأول',
    notes: 'البطارية مشمولة في الضمان لثلاث سنوات من الوكيل.',
  },
  {
    id: 'app-5',
    name: 'شاشة سوني أوليد 65 بوصة 4K',
    brand: 'سوني (Sony)',
    category: 'entertainment',
    model: 'XR-65A80K',
    serialNumber: 'SNY-65OLED-901',
    purchaseDate: '2023-01-10', // Expires 2025-01-10 (Expired)
    warrantyMonths: 24,
    purchasePrice: 7500,
    location: 'المجلس الرئيسي',
    notes: 'شاشة سينمائية رائعة، الضمان منتهي ولكن لا تزال تعمل بكفاءة تامة.',
  }
];

export const INITIAL_MAINTENANCE_LOGS: MaintenanceLog[] = [
  {
    id: 'log-1',
    applianceId: 'app-1',
    date: '2025-08-14',
    cost: 350,
    type: 'repair',
    description: 'إصلاح مشكلة تسريب المياه أسفل الثلاجة وتنظيف مجرى التصريف الداخلي وتعبئة غاز فريون.',
    technicianName: 'م. أشرف - صيانة سامسونج',
    technicianPhone: '0501234567',
    nextMaintenanceDate: '2026-08-14',
    status: 'completed'
  },
  {
    id: 'log-2',
    applianceId: 'app-3',
    date: '2025-05-10',
    cost: 150,
    type: 'cleaning',
    description: 'غسيل الوحدة الداخلية والخارجية للمكيف بالضغط العالي وفحص مجرى تصريف الماء ومستوى الفريون.',
    technicianName: 'صيانة مكيفات الكوثر',
    technicianPhone: '0569876543',
    nextMaintenanceDate: '2026-05-10', // Maintenance was due recently or completed
    status: 'completed'
  },
  {
    id: 'log-3',
    applianceId: 'app-2',
    date: '2025-12-05',
    cost: 220,
    type: 'spare_parts',
    description: 'تغيير جلدة باب الغسالة التالفة لمنع تسرب المياه أثناء الغسيل، وتركيب قطعة أصلية من المصنع.',
    technicianName: 'م. أحمد السوري',
    technicianPhone: '0544556677',
    nextMaintenanceDate: '2026-12-05',
    status: 'completed'
  },
  {
    id: 'log-4',
    applianceId: 'app-3',
    date: '2026-04-15',
    cost: 120,
    type: 'routine',
    description: 'صيانة وفحص روتيني قبل بداية موسم الصيف وتأمين التوصيلات الكهربائية.',
    technicianName: 'أبو فهد للتكييف',
    technicianPhone: '0533445566',
    nextMaintenanceDate: '2026-10-15',
    status: 'completed'
  }
];
