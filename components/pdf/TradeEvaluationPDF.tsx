'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TradeData, CalculatedValues, DepreciationInfo } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { RV_TYPE_OPTIONS, isMotorized } from '@/lib/constants';
import { DISCLOSURE_LIST } from '@/lib/disclosures';
import { getConditionLabel, getMarketDemand } from '@/lib/pdf-assets';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { DepreciationChartPDF } from './DepreciationChartPDF';

export interface TradeEvaluationPDFProps {
  data: TradeData;
  calculated: CalculatedValues;
  depreciation?: DepreciationInfo;
  generatedDate?: Date;
  userName?: string;
  storeCode?: string;
  // Pre-fetched logo data URI
  logoSrc?: string;
  // Comparable range from API ValuationResult
  minValue?: number;
  maxValue?: number;
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingVertical: 24,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  section: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 3,
    marginBottom: 4,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingVertical: 1,
  },
  label: {
    width: '45%',
    color: '#6b7280',
    fontSize: 9,
  },
  value: {
    width: '55%',
    fontWeight: 'bold',
    fontSize: 9,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  // Market snapshot
  italicNote: {
    fontSize: 7,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  italicNoteSpaced: {
    fontSize: 7,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Retail range
  rangeBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingVertical: 3,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  rangeDash: {
    fontSize: 14,
    color: '#9ca3af',
    alignSelf: 'center',
  },
  rangeDisclaimer: {
    fontSize: 7,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Dealer costs
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  costLabel: {
    fontSize: 9,
    color: '#374151',
  },
  costValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  costTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
  },
  costTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  costTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  costFraming: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 1.3,
  },
  // Final offer
  offerSection: {
    backgroundColor: '#16a34a',
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  offerLabel: {
    fontSize: 9,
    color: '#dcfce7',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  offerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  offerValidity: {
    fontSize: 7,
    color: '#dcfce7',
    marginTop: 4,
  },
  // Notes
  notesSection: {
    padding: 10,
    backgroundColor: '#fefce8',
    borderRadius: 4,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#713f12',
    lineHeight: 1.4,
  },
  // Disclosures
  disclosures: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 4,
  },
  disclosuresTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  disclosureItem: {
    fontSize: 7,
    color: '#9ca3af',
    marginBottom: 1,
    lineHeight: 1.3,
  },
});

function getRVTypeLabel(rvType: string) {
  return RV_TYPE_OPTIONS.find((opt) => opt.value === rvType)?.label || rvType;
}

function VehicleOverviewRows({ data }: { data: TradeData }) {
  return (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>Year / Make / Model</Text>
        <Text style={styles.value}>
          {data.year || '-'} {data.make} {data.model}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>VIN</Text>
        <Text style={styles.value}>{data.vin || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>RV Type</Text>
        <Text style={styles.value}>{getRVTypeLabel(data.rvType)}</Text>
      </View>
      {isMotorized(data.rvType) && (
        <View style={styles.row}>
          <Text style={styles.label}>Mileage</Text>
          <Text style={styles.value}>{data.mileage?.toLocaleString() || '-'}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.label}>Overall Condition</Text>
        <Text style={styles.value}>{getConditionLabel(data.conditionScore)}</Text>
      </View>
    </>
  );
}

export function TradeEvaluationPDF({
  data,
  calculated,
  depreciation,
  generatedDate = new Date(),
  userName,
  storeCode,
  logoSrc,
  minValue,
  maxValue,
}: TradeEvaluationPDFProps) {
  const dateStr = generatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const metadataParts = [dateStr, userName, storeCode].filter(Boolean);
  const metadataStr = metadataParts.join(' | ');

  const customerFullName = [data.customerFirstName, data.customerLastName]
    .filter(Boolean)
    .join(' ');
  const hasCustomerInfo = !!(
    customerFullName ||
    data.customerPhone ||
    data.customerEmail
  );

  // Dealer cost calculations
  const reconditioningSafety =
    calculated.pdiCost + calculated.reconCost + data.additionalPrepCost;

  // Market & Holding Costs
  const monthsToSell = depreciation?.monthsToSell ?? 0;
  const depreciationMonths = depreciation?.depreciationMonths;
  let depreciationDelta = 0;
  if (
    depreciationMonths &&
    monthsToSell > 0 &&
    monthsToSell <= depreciationMonths.length
  ) {
    depreciationDelta = Math.max(
      0,
      calculated.bishTIVBase - depreciationMonths[monthsToSell - 1].amount
    );
  }
  const floorPlanInterest =
    (0.075 / 12) * monthsToSell * calculated.totalUnitCosts;
  const marketHoldingCost = depreciationDelta + floorPlanInterest;

  const totalDealerCosts = reconditioningSafety + marketHoldingCost;

  const hasComparableRange =
    minValue != null && maxValue != null && minValue > 0 && maxValue > 0;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* 1. Header with logo */}
        <PDFHeader
          title="Trade-In Evaluation Summary"
          metadataStr={metadataStr}
          logoSrc={logoSrc}
        />

        {/* 2. Customer Info + Vehicle Overview (side-by-side when customer info exists) */}
        <View style={styles.section}>
          {hasCustomerInfo ? (
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                {customerFullName && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{customerFullName}</Text>
                  </View>
                )}
                {data.customerPhone && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{data.customerPhone}</Text>
                  </View>
                )}
                {data.customerEmail && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{data.customerEmail}</Text>
                  </View>
                )}
              </View>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Trade-In Vehicle Overview</Text>
                <VehicleOverviewRows data={data} />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Trade-In Vehicle Overview</Text>
              <View style={styles.twoColumn}>
                <View style={styles.column}>
                  <VehicleOverviewRows data={data} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 3. Current Market Snapshot */}
        {depreciation?.monthsToSell !== undefined && (
          <View style={styles.section}>
            <View style={styles.twoColumn}>
              {/* Left: header + market data */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Current Market Snapshot</Text>
                {depreciation.vehicleAge !== undefined && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Vehicle Age</Text>
                    <Text style={styles.value}>
                      {depreciation.vehicleAge} year
                      {depreciation.vehicleAge !== 1 && 's'}
                    </Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>Est. Time to Resell</Text>
                  <Text style={styles.value}>
                    Approximately {depreciation.monthsToSell} month
                    {depreciation.monthsToSell !== 1 && 's'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Market Demand</Text>
                  <Text style={styles.value}>
                    {getMarketDemand(depreciation.monthsToSell ?? 0)}
                  </Text>
                </View>
              </View>
              {/* Right: depreciation chart (inline with header) */}
              <View style={styles.column}>
                {depreciationMonths && depreciationMonths.length >= 2 ? (
                  <DepreciationChartPDF data={depreciationMonths} height={110} />
                ) : (
                  <Text
                    style={{
                      fontSize: 8,
                      color: '#9ca3af',
                      fontStyle: 'italic',
                      paddingVertical: 20,
                      textAlign: 'center',
                    }}
                  >
                    Depreciation chart not available
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.italicNoteSpaced}>
              As RVs age, resale timelines and preparation requirements
              increase, which impacts overall trade-in value.
            </Text>
          </View>
        )}

        {/* 4. Estimated Retail Market Range */}
        {hasComparableRange && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Estimated Retail Market Range
            </Text>
            <View style={styles.rangeBox}>
              <Text style={styles.rangeValue}>
                {formatCurrency(minValue!)}
              </Text>
              <Text style={styles.rangeDash}>—</Text>
              <Text style={styles.rangeValue}>
                {formatCurrency(maxValue!)}
              </Text>
            </View>
            <Text style={styles.rangeDisclaimer}>
              Based on comparable listings. Asking prices may differ from actual
              selling prices.
            </Text>
          </View>
        )}

        {/* 5. Dealer Costs Required to Resell */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Dealer Costs Required to Resell
          </Text>
          <Text style={styles.costFraming}>
            Before we can offer your trade-in for resale, the following costs are
            required to prepare, certify, and hold the unit:
          </Text>

          <View style={styles.costItem}>
            <Text style={styles.costLabel}>
              Reconditioning & Safety Certification
            </Text>
            <Text style={styles.costValue}>
              {formatCurrency(reconditioningSafety)}
            </Text>
          </View>

          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Market & Holding Costs</Text>
            <Text style={styles.costValue}>
              {formatCurrency(marketHoldingCost)}
            </Text>
          </View>

          <View style={styles.costTotal}>
            <Text style={styles.costTotalLabel}>
              Total Estimated Dealer Costs
            </Text>
            <Text style={styles.costTotalValue}>
              {formatCurrency(totalDealerCosts)}
            </Text>
          </View>
        </View>

        {/* 6. Final Trade-In Offer */}
        <View style={styles.offerSection}>
          <Text style={styles.offerLabel}>Final Trade-In Offer</Text>
          <Text style={styles.offerValue}>
            {formatCurrency(calculated.finalTradeOffer)}
          </Text>
          <Text style={styles.offerValidity}>
            This offer is valid for 7 calendar days from the date above.
          </Text>
        </View>

        {/* 7. Valuation Notes */}
        {data.valuationNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Valuation Notes</Text>
            <Text style={styles.notesText}>{data.valuationNotes}</Text>
          </View>
        )}

        {/* 8. Important Disclosures */}
        <View style={styles.disclosures}>
          <Text style={styles.disclosuresTitle}>Important Disclosures</Text>
          {DISCLOSURE_LIST.map((disclosure, index) => (
            <Text key={index} style={styles.disclosureItem}>
              {index + 1}. {disclosure}
            </Text>
          ))}
        </View>

        {/* 9. Footer */}
        <PDFFooter stockNumber={data.stockNumber} metadataStr={metadataStr} />
      </Page>

    </Document>
  );
}
