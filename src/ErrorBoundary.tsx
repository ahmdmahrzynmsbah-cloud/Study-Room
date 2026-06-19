/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in StudyRoom app:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-6 select-none" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] flex items-center justify-center text-4xl shadow-xl animate-pulse">
            🛠️
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 font-sans">
              عذراً، حدث خطأ غير متوقع في كود الواجهة!
            </h1>
            <p className="text-2xl font-bold text-red-500">
              {this.state.error?.message}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
              قد يكون هذا بسبب تضارب في البيانات المحفوظة محلياً أو نسخة قديمة مخزنة مؤقتاً في متصفحك. يمكنك حل هذا فوراً بالضغط على زر الإصلاح أدناه.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-[10px] text-red-400 font-mono text-left max-w-lg mx-auto overflow-auto max-h-36 w-full">
            {this.state.error?.stack || this.state.error?.toString()}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              تنظيف الذاكرة المؤقتة وإعادة تشغيل نظيف 🔄
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-slate-50 border-slate-200 border border-slate-200 text-slate-800 font-sans text-xs font-bold rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              تحديث الصفحة فقط
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
