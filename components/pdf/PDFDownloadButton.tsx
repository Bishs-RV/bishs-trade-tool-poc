'use client';

import dynamic from 'next/dynamic';
import { TradeData, CalculatedValues, DepreciationInfo } from '@/lib/types';
import { TradeEvaluationPDF } from './TradeEvaluationPDF';
import { Button } from '@/components/ui/button';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const BlobProvider = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
  {
    ssr: false,
    loading: () => (
      <Button type="button" variant="primary" size="lg" disabled>
        <span className="animate-spin">&#9696;</span>
        <span>Loading...</span>
      </Button>
    ),
  }
);

interface PDFDownloadButtonProps {
  data: TradeData;
  calculated: CalculatedValues;
  depreciation?: DepreciationInfo;
  disabled?: boolean;
}

export function PDFDownloadButton({
  data,
  calculated,
  depreciation,
  disabled = false,
}: PDFDownloadButtonProps) {
  const today = new Date();

  if (disabled) {
    return (
      <Button type="button" variant="primary" size="lg" disabled>
        <span>🖨</span>
        <span>PDF PRINTOUT</span>
      </Button>
    );
  }

  return (
    <BlobProvider
      document={
        <TradeEvaluationPDF
          data={data}
          calculated={calculated}
          depreciation={depreciation}
          generatedDate={today}
        />
      }
    >
      {({ url, loading }) =>
        loading ? (
          <Button type="button" variant="primary" size="lg" disabled>
            <span className="animate-spin">&#9696;</span>
            <span>Loading...</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              if (url) {
                window.open(url, '_blank');
              }
            }}
          >
            <span>🖨</span>
            <span>PDF PRINTOUT</span>
          </Button>
        )
      }
    </BlobProvider>
  );
}
