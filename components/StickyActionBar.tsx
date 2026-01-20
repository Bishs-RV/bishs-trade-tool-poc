'use client';

import { Button } from '@/components/ui/button';
import { PDFDownloadButton } from '@/components/pdf/PDFDownloadButton';
import { TradeData, CalculatedValues, DepreciationInfo } from '@/lib/types';

interface StickyActionBarProps {
  isLocked: boolean;
  isSubmitting: boolean;
  data: TradeData;
  calculated: CalculatedValues;
  depreciation?: DepreciationInfo;
}

export default function StickyActionBar({
  isLocked,
  isSubmitting,
  data,
  calculated,
  depreciation,
}: StickyActionBarProps) {
  if (isLocked) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-3">
      <PDFDownloadButton
        data={data}
        calculated={calculated}
        depreciation={depreciation}
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>SAVING...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>SUBMIT</span>
            <span className="text-xl">→</span>
          </span>
        )}
      </Button>
    </div>
  );
}
