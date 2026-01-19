'use client';

import TradeForm from '@/components/forms/TradeForm';

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 p-2">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="relative overflow-hidden text-center mb-2 py-2 px-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg border border-slate-600 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent" />
          <h1 className="relative z-10 text-2xl font-black text-white tracking-tight">
            Bish&apos;s Trade-In Tool
          </h1>

          {/* User Name Display */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <p className="text-xs text-white">
              <span className="opacity-80">User:</span>{' '}
              <span className="font-bold">Julian Baden</span>
            </p>
          </div>
        </header>

        {/* Main Form */}
        <TradeForm />
      </div>
    </div>
  );
}
