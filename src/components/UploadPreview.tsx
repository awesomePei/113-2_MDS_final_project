import React, { useState } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');

  if (uploadedData.length === 0) {
    return null;
  }

  const displayOrder = [
    'order date (DateOrders)',
    'Customer Country',
    'Customer City',
    'Shipping Mode',
  ];

  const displayNames: Record<string, string> = {
    'order date (DateOrders)': 'Order Time',
    'Customer Country': 'Country',
    'Customer City': 'City',
    'Shipping Mode': 'Shipping Mode',
  };

  const trimmedSearch = searchTerm.trim();
  const searchIndex = Number(trimmedSearch) - 1;

  const filteredData =
    trimmedSearch === ''
      ? uploadedData.map((row, idx) => ({ row, idx }))
      : uploadedData
        .map((row, idx) => ({ row, idx }))
        .filter(({ idx }) => idx === searchIndex);

  return (
    <div className="w-full">
      {/* 搜尋框 */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search Order # (e.g. 1, 2, 10...)"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 卡片顯示區 */}
      <div className="flex flex-wrap gap-8 justify-center mx-auto p-4">
        {filteredData.length === 0 ? (
          <div className="text-gray-500 text-sm mt-4">No matching order found.</div>
        ) : (
          filteredData.map(({ row, idx }) => (
            <div
              key={idx}
              className="bg-white shadow-xl rounded-2xl border border-gray-200 p-6 w-full max-w-lg transition-all hover:shadow-indigo-400 flex"
            >
              {/* 左側：訂單資訊 */}
              <div className="flex-1 pr-6 min-w-0 break-words">
                <div className="font-bold text-indigo-700 text-xl mb-4">
                  Order #{idx + 1}
                </div>

                <div className="space-y-2">
                  {displayOrder.map((key) => (
                    <div key={key} className="flex justify-between items-center text-gray-800">
                      <span className="font-bold text-sm text-gray-600">{displayNames[key]}</span>

                      <span className="text-sm">{row[key]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右側：預測結果與回歸結果，垂直排列 */}
              <div className="flex flex-col justify-start space-y-6 min-w-[140px]">
                {predictions && (
                  <div className="border-t-2 border-indigo-300 pt-4 flex flex-col items-center bg-indigo-50 rounded-lg shadow-md px-4">
                    <span className="text-indigo-700 font-extrabold text-lg mb-1">
                      Probability of Delay
                    </span>
                    <span className="text-indigo-900 font-extrabold text-2xl">
                      {predictions[idx] !== undefined ? `${predictions[idx].toFixed(1)}%` : '-'}
                    </span>
                  </div>
                )}

                {regressionResults && (
                  <div className="border-t-2 border-green-300 pt-4 flex flex-col items-center bg-green-50 rounded-lg shadow-md px-4">
                    <span className="text-green-700 font-extrabold text-lg mb-1">
                      Predicted Delay Days
                    </span>
                    <span className="text-green-900 font-extrabold text-2xl">
                      {regressionResults[idx] !== undefined
                        ? `${regressionResults[idx].toFixed(3)} days`
                        : '-'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UploadPreview;
