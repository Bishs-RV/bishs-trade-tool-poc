'use client';

import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 6,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  logo: {
    height: 30,
    width: 210,
  },
});

interface PDFHeaderProps {
  title: string;
  metadataStr?: string;
  logoSrc?: string;
}

export function PDFHeader({ title, metadataStr, logoSrc }: PDFHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>{title}</Text>
        {metadataStr && (
          <Text style={styles.subtitle}>
            {"Bish's RV"} | {metadataStr}
          </Text>
        )}
      </View>
      {logoSrc && (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image doesn't support alt
        <Image style={styles.logo} src={logoSrc} />
      )}
    </View>
  );
}
