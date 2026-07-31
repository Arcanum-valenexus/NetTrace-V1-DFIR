import React, { useState } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { logoutUser, showToast } = useInvestigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    showToast('Logged out successfully.', 'success');
    
    // Redirect to Login/Landing after a short delay
    setTimeout(() => {
      logoutUser();
      setIsLoggingOut(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative font-mono-code">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/50 shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">
              Confirm Station Logout
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              NetTrace V1.0 Command Center Session
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active Investigation Warning</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Are you sure you want to logout? Unsaved investigation changes may be lost.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all border border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
