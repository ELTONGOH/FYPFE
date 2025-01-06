import React from 'react';

interface TwoColorProgressBarProps {
  value1: number;
  value2: number;
  label1: string;
  label2: string;
}

const TwoColorProgressBar: React.FC<TwoColorProgressBarProps> = ({ value1, value2, label1, label2 }) => {
  const total = value1 + value2;
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm">
        <span>{label1}: {value1}%</span>
        <span>{label2}: {value2}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className="flex h-full">
          <div 
            className="bg-blue-500"
            style={{ width: `${percentage1}%` }}
          />
          <div 
            className="bg-green-500"
            style={{ width: `${percentage2}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TwoColorProgressBar;

