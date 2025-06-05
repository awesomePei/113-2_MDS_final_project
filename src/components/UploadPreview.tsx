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

  return (
    <div className="flex flex-wrap gap-6 justify-center mx-auto p-4">
      {uploadedData.map((row, idx) => (
        <div
          key={idx}
          className="bg-white shadow-xl rounded-2xl border border-gray-200 p-6 w-full max-w-md transition-all hover:shadow-indigo-400"
        >
          <div className="font-bold text-indigo-700 text-xl mb-4">
            Order #{idx + 1}
          </div>

          <div className="space-y-2">
            {displayOrder.map((key) => (
              <div key={key} className="flex justify-between items-center text-gray-800">
                <span className="font-medium text-sm text-gray-600">{displayNames[key]}</span>
                <span className="text-sm">{row[key]}</span>
              </div>
            ))}
          </div>

          {predictions && (
            <div className="mt-5 border-t pt-3 border-gray-200 flex justify-between items-center">
              <span className="text-indigo-600 font-semibold text-sm">Probability of Delay</span>
              <span className="text-indigo-800 font-bold text-sm">
                {predictions[idx] !== undefined ? `${predictions[idx].toFixed(1)}%` : '-'}
              </span>
            </div>
          )}

          {regressionResults && (
            <div className="mt-2 border-t pt-3 border-gray-200 flex justify-between items-center">
              <span className="text-green-600 font-semibold text-sm">Predicted Delay Days</span>
              <span className="text-green-800 font-bold text-sm">
                {regressionResults[idx] !== undefined
                  ? `${regressionResults[idx].toFixed(3)} days`
                  : '-'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadPreview;
