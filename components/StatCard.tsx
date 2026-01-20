import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon, valueColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className={`text-2xl font-bold mb-1 ${valueColor || 'text-gray-900'}`}>{value}</h3>
        <p className="text-xs text-gray-400 font-medium">{subtext}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
        {icon}
      </div>
    </div>
  );
};
