'use client';

import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 24,
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

interface PDFFooterProps {
  stockNumber?: string;
  metadataStr?: string;
}

export function PDFFooter({ stockNumber, metadataStr }: PDFFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text>
        {"Bish's RV"} | Trade-In Evaluation | Stock: {stockNumber || 'N/A'}
        {metadataStr ? ` | ${metadataStr}` : ''}
      </Text>
    </View>
  );
}
