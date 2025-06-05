// components/UploadPreview.tsx
import React from 'react';

interface UploadPreviewProps {
  uploadedData: Record<string, string>[];
  predictions: number[] | null;
  regressionResults: number[] | null;
}

const UploadPreview: React.FC<UploadPreviewProps> = ({
  uploadedData,
  predictions,
  regressionResults,
}) => {
  if (uploadedData.length === 0) {
    return null;
  }

  // 你指定要顯示的欄位順序（key要跟資料中欄位一樣）
  const displayOrder = [
    'order date (DateOrders)',  // 原欄位名
    'Customer Country',
    'Customer City',
    'Shipping Mode',
  ];

  // 顯示欄位對應的名稱
  const displayNames: Record<string, string> = {
    'order date (DateOrders)': 'Order Time',
    'Customer Country': 'Country',
    'Customer City': 'City',
    'Shipping Mode': 'Shipping Mode',
  };

  return (
    <div className="flex flex-wrap gap-6 max-w-full overflow-x-auto justify-center mx-auto">
      {uploadedData.map((row, idx) => (
        <div
          key={idx}
          className="bg-white shadow-lg rounded-xl border border-gray-300 p-5 w-full flex flex-col hover:shadow-indigo-300 transition-shadow"
        >
          {/* 顯示 Record ID */}
          <div className="font-bold text-indigo-600 mb-3 text-lg">
            Order #{idx + 1}
          </div>

          {displayOrder.map((key) => (
            <div
              key={key}
              className="flex justify-between py-2 border-b last:border-b-0 border-gray-200"
            >
              <span className="font-semibold text-gray-700">{displayNames[key]}</span>
              <span className="text-gray-900 text-right">{row[key]}</span>
            </div>
          ))}

          {predictions && (
            <div className="flex justify-between py-2 border-t border-gray-300 mt-4 text-indigo-700 font-semibold text-lg">
              <span>Prediction</span>
              <span>{predictions[idx] !== undefined ? predictions[idx].toFixed(3) : '-'}</span>
            </div>
          )}

          {regressionResults && (
            <div className="flex justify-between py-2 border-t border-gray-300 mt-2 text-green-700 font-semibold text-lg">
              <span>Regression</span>
              <span>{regressionResults[idx] !== undefined ? regressionResults[idx].toFixed(3) : '-'}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadPreview;
