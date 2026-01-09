'use client';

import dynamic from 'next/dynamic';
import { TradeData, CalculatedValues } from '@/lib/types';
import { TradeEvaluationPDF } from './TradeEvaluationPDF';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <ButtonLoading />,
  }
);

function ButtonLoading() {
  return (
    <button
      type="button"
      disabled
      className="px-4 py-2 text-xs text-white font-bold rounded-lg shadow-md bg-slate-500 border border-slate-400 flex items-center gap-2 cursor-not-allowed"
    >
      <span className="animate-spin">&#9696;</span>
      <span>Loading...</span>
    </button>
  );
}

interface PDFDownloadButtonProps {
  data: TradeData;
  calculated: CalculatedValues;
  disabled?: boolean;
}

export function PDFDownloadButton({
  data,
  calculated,
  disabled = false,
}: PDFDownloadButtonProps) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `Bishs-Trade-Evaluation-${data.stockNumber || 'draft'}-${dateStr}.pdf`;

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="px-4 py-2 text-xs text-gray-400 font-bold rounded-lg shadow-md bg-gray-200 border border-gray-300 flex items-center gap-2 cursor-not-allowed"
      >
        <span>&#128438;</span>
        <span>Download PDF</span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <TradeEvaluationPDF
          data={data}
          calculated={calculated}
          generatedDate={today}
        />
      }
      fileName={filename}
    >
      {({ loading }) =>
        loading ? (
          <ButtonLoading />
        ) : (
          <button
            type="button"
            className="px-4 py-2 text-xs text-white font-bold rounded-lg shadow-md transition-all bg-slate-700 hover:bg-slate-800 transform hover:scale-105 active:scale-95 border border-slate-600 flex items-center gap-2"
          >
            <span>&#128438;</span>
            <span>Download PDF</span>
          </button>
        )
      }
    </PDFDownloadLink>
  );
}
