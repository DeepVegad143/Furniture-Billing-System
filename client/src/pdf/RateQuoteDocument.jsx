import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { formatIndianNumber } from '@calc';
import { registerPdfFonts } from './fonts';

registerPdfFonts();

const NAVY = '#1B2750';
const WOOD = '#B5773A';
const BORDER_COLOR = '#D1D5DB';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 7.5,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: NAVY,
    paddingBottom: 7,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 48,
    height: 60, // Exact 0.8033 aspect ratio
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: NAVY,
    letterSpacing: 0.5,
  },
  businessSub: {
    fontSize: 7.5,
    color: WOOD,
    fontWeight: 'bold',
    marginTop: 1.5,
  },
  businessPhone: {
    fontSize: 7,
    color: '#4B5563',
    marginTop: 1.5,
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  quoteBadge: {
    backgroundColor: WOOD,
    color: '#FFFFFF',
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  metaText: {
    fontSize: 7.5,
    color: '#4B5563',
  },
  customerBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 0.8,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  customerVal: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NAVY,
  },
  titleBanner: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: NAVY,
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  table: {
    width: '100%',
    marginBottom: 7,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 7.5,
    paddingVertical: 4.5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 4.2,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  zebraRow: {
    backgroundColor: '#FBFBFA',
  },
  colNo: { width: '6%', textAlign: 'center', fontSize: 7.2 },
  colItem: { width: '60%', paddingLeft: 6, fontSize: 7.5 },
  colUnit: { width: '17%', textAlign: 'center', fontSize: 7.2 },
  colRate: { width: '17%', textAlign: 'right', paddingRight: 8, fontSize: 7.5 },
  conditionsBox: {
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 6,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  conditionsHeading: {
    fontSize: 7,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  conditionItem: {
    fontSize: 6.5,
    color: '#4B5563',
    marginBottom: 1.5,
    lineHeight: 1.2,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 4,
  },
  signatureBox: {
    width: '38%',
    textAlign: 'center',
    fontSize: 7.2,
    color: '#4B5563',
  },
  signatureLine: {
    borderTopWidth: 0.8,
    borderTopColor: '#9CA3AF',
    marginBottom: 4,
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.8,
    color: '#9CA3AF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 3,
  },
});

export default function RateQuoteDocument({ quote, customer, settings, lang = 'en' }) {
  const businessName = 'Deep Furniture';

  const conditionsList = settings?.conditions?.en?.length
    ? settings.conditions.en
    : [
        'Machine, router work & CNC charge will be borne by the client.',
        'Any modifications or changes in work will be charged separately.',
        'Payment withdrawals will be taken every 15 days.',
        'Client will arrange granite, marble, kota, or door frame drilling.',
        'We do not take responsibility for laminate issues arising from extreme weather or ballooning.',
      ];

  const custName = customer?.name?.trim() || quote.customerSnapshot?.name?.trim() || '';
  const custPhone = customer?.phone?.trim() || quote.customerSnapshot?.phone?.trim() || '';

  return (
    <Document title={`Rate Quote - ${custName || 'Deep Furniture'}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/logo.png" style={styles.logo} />
            <View>
              <Text style={styles.businessName}>{businessName}</Text>
              <Text style={styles.businessSub}>
                Timeless Craftsmenship
              </Text>
              <Text style={styles.businessPhone}>
                Contact: {settings?.phone || '98765 43210'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.quoteBadge}>
              {quote.quoteNumber || 'RATE QUOTATION'}
            </Text>
            <Text style={styles.metaText}>Date: {quote.date}</Text>
          </View>
        </View>

        {/* Customer Box */}
        <View style={styles.customerBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={styles.customerLabel}>Customer:</Text>
            <Text style={styles.customerVal}>{custName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: 150, justifyContent: 'flex-start' }}>
            <Text style={styles.customerLabel}>Mobile:</Text>
            <Text style={[styles.customerVal, { fontSize: 8.5, flex: 1 }]}>{custPhone}</Text>
          </View>
        </View>

        {/* Table Title Banner */}
        <Text style={styles.titleBanner}>
          FURNITURE JOB WORK RATES
        </Text>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={styles.colNo}>No.</Text>
            <Text style={styles.colItem}>Description</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRate}>Rate (Rs.)</Text>
          </View>

          {quote.items.map((item, idx) => {
            const itemName = item.nameEn || item.nameGu || 'Job Item';
            return (
              <View
                key={idx}
                wrap={false}
                style={[styles.tableRow, idx % 2 === 1 ? styles.zebraRow : {}]}
              >
                <Text style={styles.colNo}>{idx + 1}</Text>
                <Text style={[styles.colItem, { fontWeight: 'bold', color: NAVY }]}>
                  {itemName}
                </Text>
                <Text style={styles.colUnit}>{item.unit}</Text>
                <Text style={[styles.colRate, { fontWeight: 'bold' }]}>
                  Rs. {formatIndianNumber(item.rate, 2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Conditions */}
        <View wrap={false} style={styles.conditionsBox}>
          <Text style={styles.conditionsHeading}>Terms & Conditions:</Text>
          {conditionsList.map((cond, idx) => (
            <Text key={idx} style={styles.conditionItem}>
              {idx + 1}. {cond}
            </Text>
          ))}
        </View>

        {/* Signatures */}
        <View wrap={false} style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text>Customer Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text>For, Deep Furniture</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Deep Furniture — Carpentry & Interior Job Works</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
