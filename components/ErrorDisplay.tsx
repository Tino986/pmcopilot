
import React from 'react';
import { ExclamationTriangleIcon } from './icons'; // Assuming you have an ExclamationTriangleIcon

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md relative ${className}`}
      role="alert"
    >
      <div className="flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-red-400" />
        <div>
          <strong className="font-semibold">Error:</strong>
          <span className="block sm:inline ml-1">{message.replace("Error: ", "")}</span>
        </div>
      </div>
    </div>
  );
};
