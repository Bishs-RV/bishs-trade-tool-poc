'use client';

import { TradeData, CalculatedValues } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Section2Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  isLocked: boolean;
}

function TierCostItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between bg-white/50 rounded px-2 py-1 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

function CostColumn({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </span>
      <span className="text-sm font-extrabold">{formatCurrency(value)}</span>
    </div>
  );
}

function ValueDisplay({ label, value, description }: { label: string; value: number; description?: string }) {
  return (
    <Card className="bg-muted/50 text-center">
      <CardContent className="py-3">
        <Label className="text-xs uppercase tracking-wide">{label}</Label>
        <p className="text-xl font-black mt-1">{formatCurrency(value)}</p>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function Section2Condition({
  data,
  calculated,
  onUpdate,
  isLocked,
}: Section2Props) {
  const conditionPenalty = (9 - data.conditionScore) * 500;
  const pointsBelow = 9 - data.conditionScore;

  return (
    <div className="relative">
      <Card className={`h-full ${isLocked ? 'pointer-events-none select-none' : ''}`}>
        {isLocked && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center">
            <div className="text-center border-2 border-dashed border-muted-foreground/40 rounded-lg p-4 bg-background/70">
              <div className="text-3xl font-black text-muted-foreground/30 mb-1">2</div>
              <p className="text-lg font-bold text-muted-foreground">Complete Step 1 to unlock</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Finish Unit Lookup first</p>
            </div>
          </div>
        )}

        <CardHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-10 h-10 rounded-full text-lg font-bold justify-center">
              2
            </Badge>
            <CardTitle className="text-2xl">Condition & Prep Costs</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Condition Score */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Condition Score <span className="text-primary">(1-9 Scale)</span></Label>
                <Badge variant="default" className="text-2xl font-black px-3 py-1">
                  {data.conditionScore}
                </Badge>
              </div>

              <Slider
                value={[data.conditionScore]}
                onValueChange={(values) => {
                  const value = values[0];
                  if (typeof value === 'number') onUpdate({ conditionScore: value });
                }}
                min={1}
                max={9}
                step={1}
                disabled={isLocked}
              />

              <div className="flex justify-between text-xs">
                <span className="text-destructive font-medium">1 (Poor)</span>
                <span className="text-yellow-600 font-medium">5 (Fair)</span>
                <span className="text-green-600 font-medium">9 (Excellent)</span>
              </div>

              {pointsBelow > 0 ? (
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-xs text-amber-800">
                    <strong>Recon Penalty:</strong> +{formatCurrency(conditionPenalty)} added to base recon
                    <span className="text-amber-600 ml-1">
                      ({pointsBelow} {pointsBelow === 1 ? 'point' : 'points'} below 9 × $500)
                    </span>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertDescription className="text-xs text-green-800">
                    <strong>No Recon Penalty</strong> — Excellent condition
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Active Cost Tier */}
          {calculated.activePrepTier && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Active Cost Tier</span>
                  <Badge variant="default" className="text-lg font-black">
                    {calculated.activePrepTier.pdiType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Based on JD Power Trade-In: <strong className="text-foreground">{formatCurrency(calculated.jdPowerTradeIn)}</strong>
                  <span className="ml-1">(Range: {calculated.activePrepTier.invoiceRange})</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <TierCostItem label="PDI Labor" value={calculated.activePrepTier.pdiLabor} />
                  <TierCostItem label="Base Recon" value={calculated.activePrepTier.recon} />
                  <TierCostItem label="Get Ready" value={calculated.activePrepTier.getReady} />
                  <TierCostItem label="Orientation" value={calculated.activePrepTier.orientation} />
                  <TierCostItem label="Detail" value={calculated.activePrepTier.detail} />
                  <TierCostItem label="Supplies" value={calculated.activePrepTier.shopSupplies} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes & Overrides */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="major-issues">Major Issues (Deductions)</Label>
                <Textarea
                  id="major-issues"
                  rows={3}
                  placeholder="List frame damage, non-working AC, or anything requiring substantial cost/reduction."
                  value={data.majorIssues}
                  onChange={(e) => onUpdate({ majorIssues: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-add-ons">Unit Add-Ons (Value Adds)</Label>
                <Textarea
                  id="unit-add-ons"
                  rows={3}
                  placeholder="List high-value aftermarket options (e.g., Solar package, upgraded stabilizer system)."
                  value={data.unitAddOns}
                  onChange={(e) => onUpdate({ unitAddOns: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-prep-cost">Additional Costs Override</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    id="additional-prep-cost"
                    className="rounded-l-none"
                    placeholder="0"
                    value={data.additionalPrepCost ? String(data.additionalPrepCost) : ''}
                    onChange={(e) => {
                      const parsed = e.target.value ? parseFloat(e.target.value) : 0;
                      onUpdate({ additionalPrepCost: isNaN(parsed) ? 0 : parsed });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prep Cost Breakdown */}
          <Card>
            <CardContent className="py-3">
              <div className="grid grid-cols-4 gap-1 border-b pb-2 mb-2">
                <CostColumn label="PDI" value={calculated.pdiCost} />
                <CostColumn label="Recon" value={calculated.reconCost} />
                <CostColumn label="Sold Prep" value={calculated.soldPrepCost} />
                <CostColumn label="Add'l" value={data.additionalPrepCost} />
              </div>
              <div className="flex justify-between items-center">
                <Label className="uppercase tracking-wide text-xs">Total Prep:</Label>
                <span className="text-xl font-black">{formatCurrency(calculated.totalPrepCosts)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 italic">
                Fixed internal costs plus Additional Costs Override
              </p>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-center text-5xl font-black text-muted-foreground">+</div>

          <ValueDisplay
            label="Bish's Trade-In Value (Base)"
            value={calculated.bishTIVBase}
            description="Factor of JD Power, Condition, Depreciation, and Likely Sales Date"
          />

          <div className="text-center text-5xl font-black text-muted-foreground">=</div>

          <ValueDisplay label="Total Bank Cost" value={calculated.totalUnitCosts} />
        </CardContent>
      </Card>
    </div>
  );
}
