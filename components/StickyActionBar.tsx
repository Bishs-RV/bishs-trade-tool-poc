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
  currentUserName?: string;
  createdBy?: string;
  createdDate?: Date;
  onSave?: () => Promise<void>;
  minValue?: number;
  maxValue?: number;
}

export default function StickyActionBar({
  isLocked,
  isSubmitting,
  data,
  calculated,
  depreciation,
  currentUserName,
  createdBy,
  createdDate,
  onSave,
  minValue,
  maxValue,
}: StickyActionBarProps) {
  if (isLocked) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3">
      <PDFDownloadButton
        data={data}
        calculated={calculated}
        depreciation={depreciation}
        currentUserName={currentUserName}
        createdBy={createdBy}
        createdDate={createdDate}
        onSave={onSave}
        minValue={minValue}
        maxValue={maxValue}
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
