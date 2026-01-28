'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { TradeData, CalculatedValues, DepreciationInfo } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { RV_TYPE_OPTIONS, isMotorized } from '@/lib/constants';
import { DISCLOSURE_LIST } from '@/lib/disclosures';

interface TradeEvaluationPDFProps {
  data: TradeData;
  calculated: CalculatedValues;
  depreciation?: DepreciationInfo;
  generatedDate?: Date;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 5,
    marginBottom: 6,
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
  offerSection: {
    backgroundColor: '#ea580c',
    padding: 12,
    marginVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  offerLabel: {
    fontSize: 9,
    color: '#fff7ed',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  offerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fefce8',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: '#713f12',
    lineHeight: 1.4,
  },
  disclosures: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  disclosuresTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 6,
  },
  disclosureItem: {
    fontSize: 8,
    color: '#9ca3af',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
});

function getRVTypeLabel(rvType: string) {
  return RV_TYPE_OPTIONS.find((opt) => opt.value === rvType)?.label || rvType;
}

export function TradeEvaluationPDF({
  data,
  calculated,
  depreciation,
  generatedDate = new Date(),
}: TradeEvaluationPDFProps) {
  const dateStr = generatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasCustomerInfo = !!(data.customerFirstName || data.customerLastName || data.customerPhone || data.customerEmail);
  const customerFullName = [data.customerFirstName, data.customerLastName].filter(Boolean).join(' ');

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trade-In Evaluation Summary</Text>
          <Text style={styles.headerSubtitle}>
            Bish&apos;s RV | Generated: {dateStr}
          </Text>
        </View>

        {/* Customer Info & Market Analysis - side by side */}
        {(hasCustomerInfo || depreciation?.monthsToSell !== undefined) && (
          <View style={styles.section}>
            <View style={styles.twoColumn}>
              {/* Customer Info */}
              {hasCustomerInfo && (
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
              )}
              {/* Market Analysis */}
              {depreciation?.monthsToSell !== undefined && (
                <View style={styles.column}>
                  <Text style={styles.sectionTitle}>Market Analysis</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Est. Time to Sell</Text>
                    <Text style={styles.value}>
                      {depreciation.monthsToSell} month{depreciation.monthsToSell !== 1 && 's'}
                    </Text>
                  </View>
                  {depreciation.vehicleAge !== undefined && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Vehicle Age</Text>
                      <Text style={styles.value}>
                        {depreciation.vehicleAge} year{depreciation.vehicleAge !== 1 && 's'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Unit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unit Information</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Stock Number</Text>
                <Text style={styles.value}>{data.stockNumber || '-'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{data.location || '-'}</Text>
              </View>
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
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>RV Type</Text>
                <Text style={styles.value}>{getRVTypeLabel(data.rvType)}</Text>
              </View>
              {isMotorized(data.rvType) && (
                <View style={styles.row}>
                  <Text style={styles.label}>Mileage</Text>
                  <Text style={styles.value}>
                    {data.mileage?.toLocaleString() || '-'}
                  </Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Condition Score</Text>
                <Text style={styles.value}>{data.conditionScore}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Valuation Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valuation Summary</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>JD Power Trade-In</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.jdPowerTradeIn)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>JD Power Retail Value</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.jdPowerRetailValue)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Bish&apos;s TIV Base</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.bishTIVBase)}
                </Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>PDI Cost</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.pdiCost)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Recon Cost</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.reconCost)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sold Prep Cost</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.soldPrepCost)}
                </Text>
              </View>
              {data.additionalPrepCost > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Additional Costs</Text>
                  <Text style={styles.value}>
                    {formatCurrency(data.additionalPrepCost)}
                  </Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Total Prep Costs</Text>
                <Text style={styles.value}>
                  {formatCurrency(calculated.totalPrepCosts)}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.row, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 }]}>
            <Text style={[styles.label, { fontWeight: 'bold' }]}>Total Bank Cost</Text>
            <Text style={[styles.value, { fontSize: 11 }]}>{formatCurrency(calculated.totalUnitCosts)}</Text>
          </View>
        </View>

        {/* Final Offer (Prominent) */}
        <View style={styles.offerSection}>
          <Text style={styles.offerLabel}>Final Trade-In Offer</Text>
          <Text style={styles.offerValue}>
            {formatCurrency(calculated.finalTradeOffer)}
          </Text>
        </View>

        {/* Notes Section (if provided) */}
        {data.valuationNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Valuation Notes</Text>
            <Text style={styles.notesText}>{data.valuationNotes}</Text>
          </View>
        )}

        {/* Disclosures */}
        <View style={styles.disclosures}>
          <Text style={styles.disclosuresTitle}>Important Disclosures</Text>
          {DISCLOSURE_LIST.map((disclosure, index) => (
            <Text key={index} style={styles.disclosureItem}>
              {index + 1}. {disclosure}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Bish&apos;s RV | Trade-In Evaluation | Stock: {data.stockNumber || 'N/A'} |
            Generated: {dateStr}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
