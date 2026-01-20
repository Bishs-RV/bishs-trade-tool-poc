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
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 6,
    marginBottom: 8,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    width: '45%',
    color: '#6b7280',
  },
  value: {
    width: '55%',
    fontWeight: 'bold',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  offerSection: {
    backgroundColor: '#ea580c',
    padding: 16,
    marginVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  offerLabel: {
    fontSize: 10,
    color: '#fff7ed',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  offerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  notesSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fefce8',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#713f12',
    lineHeight: 1.4,
  },
  disclosures: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  disclosuresTitle: {
    fontSize: 9,
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

function getRVTypeLabel(rvType: string): string {
  const option = RV_TYPE_OPTIONS.find((opt) => opt.value === rvType);
  return option?.label || rvType;
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

  const hasCustomerInfo =
    data.customerName || data.customerPhone || data.customerEmail;

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

        {/* Customer Info (if provided) */}
        {hasCustomerInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            {data.customerName && (
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{data.customerName}</Text>
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
                <Text style={styles.value}>{data.conditionScore} / 9</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Depreciation Info (if available) */}
        {depreciation?.monthsToSell !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Analysis</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Estimated Time to Sell</Text>
              <Text style={styles.value}>
                {depreciation.monthsToSell} {depreciation.monthsToSell === 1 ? 'month' : 'months'}
              </Text>
            </View>
            {depreciation.vehicleAge !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Vehicle Age</Text>
                <Text style={styles.value}>
                  {depreciation.vehicleAge} {depreciation.vehicleAge === 1 ? 'year' : 'years'}
                </Text>
              </View>
            )}
          </View>
        )}

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
          <Text style={styles.disclosuresTitle}>
            Important Disclosures
          </Text>
          {DISCLOSURE_LIST.map((disclosure, index) => (
            <Text key={disclosure} style={styles.disclosureItem}>
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
