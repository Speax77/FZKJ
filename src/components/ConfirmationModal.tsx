/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Trash2, ShieldAlert, X, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center animate-bounce">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-orange-50 text-orange-600 border border-orange-100 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-blue-50 text-[#0058bc] border border-blue-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white';
      default:
        return 'bg-[#0058bc] hover:bg-blue-700 focus:ring-[#0058bc] text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1b1f]/40 backdrop-blur-xs z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Drawer on mobile, box on desktop */}
      <div 
        className="w-full bg-white rounded-t-3xl sm:rounded-3xl sm:max-w-md overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col scale-100 animate-slide-up"
      >
        {/* Header bar for drawer closure indication or close icon */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 pt-0 text-center space-y-4 overflow-y-auto">
          <div className="flex justify-center mb-2">
            {getIcon()}
          </div>

          <h3 className="text-base font-black text-gray-900 tracking-tight leading-snug">
            {title}
          </h3>

          <div className="text-xs text-[#5c6170] leading-relaxed font-medium bg-[#f4f3f8] p-4 rounded-2xl text-left border border-gray-100/50">
            {description}
          </div>
        </div>

        {/* Action button footers */}
        <div className="p-4 border-t border-[#f4f3f8] bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
