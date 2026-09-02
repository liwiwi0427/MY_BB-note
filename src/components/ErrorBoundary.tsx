import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-6 text-[#2A2723]">
          <div className="bg-[#FAF7F0] border border-[#D9D1C2] max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2A2723]">
              頁面載入遇到微小問題
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6457] leading-relaxed">
              您的育兒日記與成長紀錄均已妥善保存在本地與雲端，請點擊下方按鈕重試或重新整理頁面。
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#D9D1C2] text-xs font-semibold text-[#2A2723] hover:bg-[#EBE7DF] transition-colors"
              >
                直接重試
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-semibold hover:bg-[#4A453E] transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新整理
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
