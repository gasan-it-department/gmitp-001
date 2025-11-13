import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import Utility from '@/pages/Utility/Utility';

// ✅ Register Roboto variants
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://raw.githack.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf', fontWeight: 400 },
    { src: 'https://raw.githack.com/googlefonts/roboto/main/src/hinted/Roboto-Medium.ttf', fontWeight: 500 },
    { src: 'https://raw.githack.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf', fontWeight: 700 },
    { src: 'https://raw.githack.com/googlefonts/roboto/main/src/hinted/Roboto-Italic.ttf', fontStyle: 'italic' },
  ],
});

// ✅ Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 8,
    borderBottom: '2pt solid #1e293b',
  },
  title: {
    marginBottom: 18,
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  subtitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
  },
  section: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 8,
    border: '1pt solid #d1d5db',
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 4,
    color: '#111827',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 500,
    width: 140,
    color: '#1e293b',
  },
  value: {
    flex: 1,
    color: '#374151',
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 6,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },
  footerLine: {
    borderTop: '1pt solid #e5e7eb',
    marginBottom: 6,
  },
  footer: {
    fontSize: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
  secondaryFooter: {
    fontSize: 8,
    textAlign: 'right',
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

interface PDFProps {
  data: AssistanceRequest | null;
  locationNames?: { provinceName: string; municipalityName: string; barangayName: string };
}

export const PDFStructure: React.FC<PDFProps> = ({ data, locationNames }) => {
  if (!data)
    return (
      <Document>
        <Page>
          <Text>No data available</Text>
        </Page>
      </Document>
    );

  const { beneficiary } = data;
  const province = locationNames?.provinceName || beneficiary.province;
  const municipality = locationNames?.municipalityName || beneficiary.municipality;
  const barangay = locationNames?.barangayName || beneficiary.barangay;
  const fullName = `${beneficiary.first_name} ${beneficiary.middle_name || ''} ${beneficiary.last_name} ${beneficiary.suffix || ''}`
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Republic of the Philippines</Text>
          <Text style={styles.subtitle}>Province of {province}</Text>
          <Text style={styles.subtitle}>Municipality of {municipality}</Text>
        </View>

        {/* Assistance Request Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistance Request Details</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Transaction No:</Text>
            <Text style={styles.value}>{data.transaction_number}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Assistance Type:</Text>
            <Text style={styles.value}>{data.assistance_type}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{data.status}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Requested On:</Text>
            <Text style={styles.value}>{Utility().formatToReadableDateNoTime(data.created_at)}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Next Request:</Text>
            <Text style={styles.value}>{Utility().formatAndAddDaysNoTime(data.created_at, 90)}</Text>
          </View>
        </View>

        {/* Beneficiary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficiary Information</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{fullName}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Birth Date:</Text>
            <Text style={styles.value}>{Utility().formatToReadableDateNoTime(beneficiary.birth_date)}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Contact No:</Text>
            <Text style={styles.value}>{beneficiary.contact_number}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Barangay:</Text>
            <Text style={styles.value}>{barangay}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Municipality:</Text>
            <Text style={styles.value}>{municipality}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Province:</Text>
            <Text style={styles.value}>{province}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Source:</Text>
            <Text style={styles.value}>{beneficiary.source}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{data.description}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerLine} />
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text style={styles.secondaryFooter}>Generated digitally | Action Center</Text>
        </View>
      </Page>
    </Document>
  );
};
