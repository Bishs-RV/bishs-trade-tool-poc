'use client';

import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { TradeData, CalculatedValues, DepreciationInfo } from '@/lib/types';
import { TradeEvaluationPDF } from './TradeEvaluationPDF';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PDFDownloadButtonProps {
  data: TradeData;
  calculated: CalculatedValues;
  depreciation?: DepreciationInfo;
  disabled?: boolean;
  currentUserName?: string;
  createdBy?: string;
  createdDate?: Date;
  onSave?: () => Promise<void>;
  minValue?: number;
  maxValue?: number;
}

export function PDFDownloadButton({
  data,
  calculated,
  depreciation,
  disabled = false,
  currentUserName,
  createdBy,
  createdDate,
  onSave,
  minValue,
  maxValue,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  // Revoke blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    const generatedDate = createdDate ? new Date(createdDate) : new Date();

    try {
      // Save in parallel with PDF generation
      const savePromise = onSave?.();

      // Pre-fetch logo as data URI (react-pdf can't reliably fetch from relative URLs)
      let logoSrc: string | undefined;
      try {
        const logoRes = await fetch('/bishs-logo.png');
        if (!logoRes.ok) throw new Error(`Logo fetch failed: ${logoRes.status}`);
        const logoBlob = await logoRes.blob();
        logoSrc = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
      } catch {
        console.error('Failed to load logo for PDF');
      }

      // Look up creator's name for loaded evaluations
      let userName: string | undefined;
      if (createdBy) {
        try {
          const res = await fetch(
            `/api/user/lookup?email=${encodeURIComponent(createdBy)}`
          );
          if (!res.ok) throw new Error('Lookup failed');
          const userData = await res.json();
          const fullName =
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          userName = fullName || createdBy.split('@')[0];
        } catch (err) {
          console.error('Failed to lookup user for PDF:', err);
          userName = createdBy.split('@')[0];
        }
      } else {
        userName = currentUserName;
      }

      const blob = await pdf(
        <TradeEvaluationPDF
          data={data}
          calculated={calculated}
          depreciation={depreciation}
          generatedDate={generatedDate}
          userName={userName}
          storeCode={data.location}
          logoSrc={logoSrc}
          minValue={minValue}
          maxValue={maxValue}
        />
      ).toBlob();

      // Wait for save to complete
      await savePromise;

      const sanitize = (str: string) =>
        str.replace(/[/\\?%*:|"<>]/g, '-');
      const customerName =
        `${data.customerFirstName || ''} ${data.customerLastName || ''}`.trim();
      const unit = `${data.make || ''} ${data.model || ''}`.trim();
      const date = generatedDate.toISOString().split('T')[0];

      const generatedFilename =
        [
          sanitize(customerName) || 'Customer',
          sanitize(unit) || 'Unit',
          date,
        ].join(' - ') + '.pdf';

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setFilename(generatedFilename);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setFilename('');
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleGeneratePDF}
        disabled={disabled || isGenerating}
      >
        <span>{isGenerating ? '⏳' : '🖨'}</span>
        <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
      </Button>

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfUrl} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Trade Evaluation PDF</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfUrl && (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full border rounded"
                title="PDF Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="primary" onClick={handleDownload}>
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
