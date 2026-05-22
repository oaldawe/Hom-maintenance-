import React from 'react';
import { Appliance, MaintenanceLog } from '../types';
import { getWarrantyStatus, formatDateString } from '../dateUtils';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../initialData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Wrench, 
  Calendar, 
  MapPin, 
  Clock,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';

interface ApplianceCardProps {
  appliance: Appliance;
  latestLog?: MaintenanceLog;
  onView: (appliance: Appliance) => void;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
  appliance,
  latestLog,
  onView,
  onEdit,
  onDelete,
}) => {
  const warranty = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyMonths);
  const colorSchema = CATEGORY_COLORS[appliance.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[appliance.category] || CATEGORY_LABELS.other;

  // Render correct warranty UI based on status
  const renderWarrantyBadge = () => {
    switch (warranty.status) {
      case 'valid':
        return (
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
            <span>ضمان ساري</span>
          </div>
        );
      case 'expiring_soon':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium animate-pulse">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-400 shrink-0" />
            <span>قرب الانتهاء</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/20 px-2.5 py-1 rounded-full font-medium">
            <ShieldX className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            <span>منتهي الضمان</span>
          </div>
        );
    }
  };

  return (
    <div 
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none text-white"
      dir="rtl"
    >
      {/* Top Card Area: Header and Badges */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          {/* Category Pill */}
          <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border bg-white/10 text-white/90 border-white/10">
            {categoryLabel}
          </span>
          
          {/* Warranty Badge */}
          {renderWarrantyBadge()}
        </div>

        {/* Title, Brand & Model */}
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-indigo-300 transition duration-200 cursor-pointer" onClick={() => onView(appliance)}>
            {appliance.name}
          </h3>
          <p className="text-xs text-white/50 font-medium">
            {appliance.brand} {appliance.model ? `• ${appliance.model}` : ''}
          </p>
        </div>

        {/* Details List */}
        <div className="space-y-2 border-t border-white/10 pt-3 text-xs text-white/60">
          {/* Location */}
          {appliance.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/40 shrink-0" />
              <span>الموقع: {appliance.location}</span>
            </div>
          )}

          {/* Warranty expiry countdown */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40 shrink-0" />
            {warranty.status === 'expired' ? (
              <span className="text-rose-400 font-medium">
                انتهى في {formatDateString(warranty.expiryDateString)} ({Math.abs(warranty.daysRemaining)} يوم مضت)
              </span>
            ) : warranty.status === 'expiring_soon' ? (
              <span className="text-amber-400 font-bold">
                ينتهي في {formatDateString(warranty.expiryDateString)} (خلال {warranty.daysRemaining} يوم!)
              </span>
            ) : (
              <span className="text-indigo-200">
                ينتهي في {formatDateString(warranty.expiryDateString)} (متبقي {Math.round(warranty.daysRemaining / 30)} شهر)
              </span>
            )}
          </div>

          {/* Next maintenance date summary */}
          {latestLog?.nextMaintenanceDate && (
            <div className="flex items-center gap-2 text-indigo-300 font-medium bg-indigo-500/10 p-1.5 rounded-md border border-indigo-500/10">
              <Wrench className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>الصيانة القادمة: {formatDateString(latestLog.nextMaintenanceDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card Area: CTA Controls (Edit, Delete, View) */}
      <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-t border-white/10 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onView(appliance)}
          className="flex items-center gap-1 text-xs text-indigo-200 font-bold hover:text-white bg-white/10 border border-white/15 hover:bg-white/15 hover:shadow-lg px-3 py-1.5 rounded-lg transition shrink-0 pointer-events-auto cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>التفاصيل والسجل</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(appliance)}
            title="تعديل"
            className="p-1.5 text-white/50 hover:text-indigo-300 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition duration-200 pointer-events-auto cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            onClick={() => onDelete(appliance.id)}
            title="حذف الجهاز"
            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition duration-200 pointer-events-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplianceCard;
