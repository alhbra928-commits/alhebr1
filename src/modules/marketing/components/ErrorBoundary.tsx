import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 flex items-center justify-center" dir="rtl">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              حدث خطأ في تحميل البيانات
            </h1>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-900 font-medium text-center mb-2">
                تعذر تحميل هذه الصفحة بشكل صحيح
              </p>
              {this.state.error && (
                <p className="text-red-700 text-sm text-center font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
              >
                إعادة المحاولة
              </button>

              <button
                onClick={() => window.location.href = '/admin/marketing'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                العودة إلى مركز القيادة
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              إذا استمرت المشكلة، تواصل مع الدعم الفني
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
