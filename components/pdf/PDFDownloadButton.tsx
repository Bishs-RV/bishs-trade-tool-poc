'use client';

import { useState } from 'react';
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
}

export function PDFDownloadButton({
  data,
  calculated,
  depreciation,
  disabled = false,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    const generatedDate = new Date();

    try {
      const blob = await pdf(
        <TradeEvaluationPDF
          data={data}
          calculated={calculated}
          depreciation={depreciation}
          generatedDate={generatedDate}
        />
      ).toBlob();

      const sanitize = (str: string) => str.replace(/[/\\?%*:|"<>]/g, '-');
      const fullName = `${data.customerFirstName || ''} ${data.customerLastName || ''}`.trim();
      const unit = `${data.make || ''} ${data.model || ''}`.trim();
      const date = generatedDate.toISOString().split('T')[0];

      const generatedFilename = [
        sanitize(fullName) || 'Customer',
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

  const isDisabled = disabled || isGenerating;
  const icon = isGenerating ? '⏳' : '🖨';
  const label = isGenerating ? 'Generating...' : 'Generate PDF';

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleGeneratePDF}
        disabled={isDisabled}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Button>

      <Dialog open={!!pdfUrl} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[65vw] sm:max-w-[65vw] h-[90vh] flex flex-col">
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
