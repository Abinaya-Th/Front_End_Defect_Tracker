import React from 'react';
import { BarChart2 } from 'lucide-react';

interface DefectToRemarkRatioProps {
  defectCount: number;
  remarkCount: number;
}

const getStatus = (ratio: number) => {
  if (ratio < 0.8) return {
    color: 'bg-yellow-400', text: 'text-yellow-700', label: 'Good', bar: 'bg-yellow-400', pill: 'bg-yellow-100',
  };
  if (ratio < 1) return {
    color: 'bg-yellow-500', text: 'text-yellow-800', label: 'Good', bar: 'bg-yellow-500', pill: 'bg-yellow-100',
  };
  if (ratio < 1.5) return {
    color: 'bg-orange-400', text: 'text-orange-700', label: 'Warning', bar: 'bg-orange-400', pill: 'bg-orange-100',
  };
  return {
    color: 'bg-red-500', text: 'text-red-700', label: 'Critical', bar: 'bg-red-500', pill: 'bg-red-100',
  };
};

const MAX_RATIO = 1.0;

const DefectToRemarkRatio: React.FC<DefectToRemarkRatioProps> = ({ defectCount, remarkCount }) => {
  const ratio = remarkCount > 0 ? defectCount / remarkCount : 0;
  const cappedRatio = Math.min(ratio, MAX_RATIO);
  const percent = Math.round((cappedRatio / MAX_RATIO) * 100);
  const { color, text, label, bar, pill } = getStatus(ratio);
  // Format as "X:1" instead of decimal
  const ratioDisplay = remarkCount > 0 ? `${Math.round(ratio)}:1` : '0:1';
  return (
    <div className="rounded-2xl shadow bg-white p-4 w-full max-w-sm">
      
      <div className={`rounded-xl p-6 flex flex-col items-center justify-center w-full ${color} bg-opacity-10 border ${color} border-opacity-30`}>
        <div className="text-5xl font-extrabold text-gray-800 mb-1">{ratioDisplay}</div>
        <div className="text-gray-600 mb-2">Defects per Remark</div>
        <span className={`px-4 py-1 rounded-full text-sm font-semibold mb-4 ${pill} ${text}`}>{label}</span>
        <div className="w-full flex flex-col items-center">
          <div className="w-full h-4 flex items-center rounded-full bg-gray-200 overflow-hidden mb-2">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${bar}`}
              style={{ width: `${percent}%`, minWidth: '0.5rem' }}
            />
          </div>
          <div className="flex w-full justify-between text-xs text-gray-500 font-medium">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectToRemarkRatio; 