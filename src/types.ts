export interface Appliance {
  id: string;
  name: string;
  category: 'kitchen' | 'laundry' | 'ac' | 'cleaning' | 'entertainment' | 'other';
  brand: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyMonths: number;
  purchasePrice?: number;
  location?: string;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  applianceId: string;
  date: string; // YYYY-MM-DD
  cost: number;
  type: 'routine' | 'repair' | 'cleaning' | 'spare_parts';
  description: string;
  technicianName?: string;
  technicianPhone?: string;
  nextMaintenanceDate?: string; // YYYY-MM-DD
  status: 'completed' | 'scheduled';
}

export interface WarrantyStatus {
  status: 'valid' | 'expiring_soon' | 'expired';
  daysRemaining: number;
  expiryDateString: string;
  monthsRemaining: number;
}
