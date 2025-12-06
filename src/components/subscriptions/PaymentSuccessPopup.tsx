'use client';

import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessPopupProps {
  onClose: () => void;
}

export default function PaymentSuccessPopup({ onClose }: SuccessPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Your subscription has been activated successfully.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              🎉 You now have access to all premium features!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/subscriptions'}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Subscription Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
