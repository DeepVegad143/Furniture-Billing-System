import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { formatIndianNumber, round2 } from '@calc';
import { registerPdfFonts } from './fonts';

registerPdfFonts();

const NAVY = '#1B2750';
const WOOD = '#B5773A';
const BORDER_COLOR = '#D1D5DB';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 45,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  // First sheet header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 65,
    height: 81, // Exact 0.8033 aspect ratio
  },
  slimLogo: {
    width: 32,
    height: 40,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NAVY,
    letterSpacing: 0.5,
  },
  businessSub: {
    fontSize: 8,
    color: WOOD,
    fontWeight: 'bold',
    marginTop: 2,
  },
  businessPhone: {
    fontSize: 8,
    color: '#4B5563',
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  billBadge: {
    backgroundColor: NAVY,
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 8.5,
    color: '#4B5563',
    marginTop: 1.5,
  },
  // Customer Box
  customerBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  customerVal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
    marginTop: 1,
  },
  // Slim Header for subsequent sheets
  slimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
    marginBottom: 12,
  },
  // Section / Page Title Heading
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: NAVY,
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  // Table
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  zebraRow: {
    backgroundColor: '#FBFBFA',
  },
  // Columns
  colNo: { width: '6%', textAlign: 'center' },
  colDesc: { width: '38%', paddingLeft: 4 },
  colSize: { width: '16%', textAlign: 'center' },
  colUnit: { width: '12%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '10%', textAlign: 'right', paddingRight: 4 },
  colAmount: { width: '10%', textAlign: 'right', paddingRight: 4 },
  // Page Total Box
  pageTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  pageTotalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NAVY,
    marginRight: 10,
  },
  pageTotalVal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
  },
  // Summary Block
  summaryBlock: {
    marginTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: NAVY,
    paddingTop: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conditionsBox: {
    width: '56%',
    borderWidth: 0.8,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FAFAFA',
  },
  conditionsHeading: {
    fontSize: 8,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  conditionItem: {
    fontSize: 6.5,
    color: '#4B5563',
    marginBottom: 2.5,
    lineHeight: 1.25,
  },
  totalsBox: {
    width: '40%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    fontSize: 8.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginVertical: 3,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: NAVY,
  },
  grandTotalVal: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: NAVY,
  },
  // Signatures
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#D1D5DB',
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#9CA3AF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
});

export default function BillDocument({ book, settings, lang = 'en' }) {
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

  const totalPagesCount = book.pages?.length || 1;
  const isMultiPage = totalPagesCount > 1;

  return (
    <Document title={`Bill ${book.billNumber} - ${book.customerId?.name || 'Customer'}`}>
      {/* RENDER EACH APP PAGE ON ITS OWN FRESH PDF SHEET */}
      {book.pages.map((appPage, pageIdx) => {
        const isFirstSheet = pageIdx === 0;

        return (
          <Page key={appPage._id || pageIdx} size="A4" style={styles.page}>
            {/* Header: Full on Sheet 1, Slim on later sheets */}
            {isFirstSheet ? (
              <>
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
                    <Text style={styles.billBadge}>BILL NO: {book.billNumber}</Text>
                    <Text style={styles.metaText}>Date: {book.date}</Text>
                    {book.title && (
                      <Text style={[styles.metaText, { fontWeight: 'bold' }]}>
                        Job: {book.title}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Customer Box on Sheet 1 */}
                <View style={styles.customerBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Text style={styles.customerLabel}>Customer:</Text>
                    <Text style={styles.customerVal}>
                      {book.customerId?.name?.trim() || ''}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: 150, justifyContent: 'flex-start' }}>
                    <Text style={styles.customerLabel}>Mobile:</Text>
                    <Text style={[styles.customerVal, { fontSize: 9.5, flex: 1 }]}>
                      {book.customerId?.phone?.trim() || ''}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.slimHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Image src="/logo.png" style={styles.slimLogo} />
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: NAVY }}>
                    {businessName}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 8, color: '#4B5563' }}>
                    Bill: {book.billNumber} | Customer: {book.customerId?.name || ''}
                  </Text>
                </View>
              </View>
            )}

            {/* App Page Title Heading */}
            <Text style={styles.sectionTitle}>
              {appPage.title || `Page ${pageIdx + 1}`}
            </Text>

            {/* Items Table */}
            <View style={styles.table}>
              {/* Header row repeats on page break */}
              <View style={styles.tableHeaderRow} fixed>
                <Text style={styles.colNo}>No.</Text>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colSize}>Size (in)</Text>
                <Text style={styles.colUnit}>Unit</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colRate}>Rate (Rs.)</Text>
                <Text style={styles.colAmount}>Amount (Rs.)</Text>
              </View>

              {/* Rows */}
              {appPage.items.map((item, itemIdx) => {
                const isEven = itemIdx % 2 === 1;

                const isInsideLaminate = item.isInsideLaminate || (item.nameEn && /inside\s*[-–]?\s*laminate/i.test(item.nameEn));
                const isRF = item.unit === 'R.F' || item.unit === 'RF' || (item.nameEn && /\(RF\)/i.test(item.nameEn));

                let sizeText = '—';
                let sizeSubtext = null;
                let displayQty = item.qty;

                if (isInsideLaminate) {
                  const currentSheets = item.sheets !== undefined && item.sheets !== 0 ? item.sheets : (item.qty || 0);
                  const sqft = round2(currentSheets * 32);
                  sizeText = `${currentSheets} Sheet${currentSheets === 1 ? '' : 's'}`;
                  sizeSubtext = `(${sqft} sq.ft)`;
                  displayQty = currentSheets;
                } else if (isRF) {
                  const feet = item.length > 0 ? round2(item.length / 12) : 0;
                  sizeText = item.length > 0 ? `${item.length}"` : '—';
                  sizeSubtext = feet > 0 ? `(${feet} ft)` : null;
                  displayQty = '—';
                } else if (item.unit === 'SQ.FT') {
                  sizeText = item.length > 0 && item.width > 0 ? `${item.length} x ${item.width}` : (item.length > 0 ? `${item.length}` : '—');
                  sizeSubtext = item.length > 0 && item.width > 0 ? `(${round2((item.length * item.width) / 144)} sq.ft)` : null;
                  displayQty = item.qty;
                } else {
                  sizeText = '—';
                  displayQty = item.qty;
                }

                // Use English name to prevent font overlap glitches
                const itemName = item.nameEn || item.nameGu || 'Job Item';

                return (
                  <View
                    key={item._id || itemIdx}
                    wrap={false}
                    style={[styles.tableRow, isEven ? styles.zebraRow : {}]}
                  >
                    <Text style={styles.colNo}>{itemIdx + 1}</Text>
                    <View style={styles.colDesc}>
                      <Text style={{ fontWeight: 'bold', color: NAVY }}>
                        {itemName}
                      </Text>
                      {item.note && (
                        <Text style={{ fontSize: 6.5, color: '#6B7280', marginTop: 1 }}>
                          {item.note}
                        </Text>
                      )}
                    </View>
                    <View style={styles.colSize}>
                      <Text>{sizeText}</Text>
                      {sizeSubtext && (
                        <Text style={{ fontSize: 6.5, color: '#6B7280', marginTop: 1 }}>
                          {sizeSubtext}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.colUnit}>{item.unit}</Text>
                    <Text style={styles.colQty}>{displayQty}</Text>
                    <Text style={styles.colRate}>
                      {formatIndianNumber(item.rate, 2)}
                    </Text>
                    <Text style={styles.colAmount}>
                      {formatIndianNumber(item.amount, 2)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* App Page Total at the end of this page's items */}
            <View wrap={false} style={styles.pageTotalRow}>
              <Text style={styles.pageTotalLabel}>
                {appPage.title || `Page ${pageIdx + 1}`} Total:
              </Text>
              <Text style={styles.pageTotalVal}>
                Rs. {formatIndianNumber(appPage.pageTotal || 0, 2)}
              </Text>
            </View>

            {/* SINGLE PAGE BOOK ONLY: If book has exactly 1 page, render totals & conditions here */}
            {!isMultiPage && (
              <View wrap={false} style={styles.summaryBlock}>
                <View style={styles.summaryGrid}>
                  {/* Conditions */}
                  <View style={styles.conditionsBox}>
                    <Text style={styles.conditionsHeading}>Terms & Conditions:</Text>
                    {conditionsList.map((cond, idx) => (
                      <Text key={idx} style={styles.conditionItem}>
                        {idx + 1}. {cond}
                      </Text>
                    ))}
                  </View>

                  {/* Totals */}
                  <View style={styles.totalsBox}>
                    <View style={styles.totalRow}>
                      <Text style={{ color: '#4B5563' }}>Grand Total:</Text>
                      <Text style={{ fontWeight: 'bold' }}>
                        Rs. {formatIndianNumber(book.grandTotal, 2)}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={{ color: '#4B5563' }}>Paid Amount:</Text>
                      <Text style={{ fontWeight: 'bold', color: '#065F46' }}>
                        Rs. {formatIndianNumber(book.paidTotal, 2)}
                      </Text>
                    </View>
                    <View style={styles.grandTotalRow}>
                      <Text style={styles.grandTotalLabel}>Balance Due:</Text>
                      <Text style={styles.grandTotalVal}>
                        Rs. {formatIndianNumber(book.balance, 2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Signatures */}
                <View style={styles.signatureRow}>
                  <View style={styles.signatureBox}>
                    <Text>Customer Signature</Text>
                  </View>
                  <View style={styles.signatureBox}>
                    <Text>For, Deep Furniture</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer} fixed>
              <Text>Deep Furniture — Carpentry & Interior Job Works</Text>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        );
      })}

      {/* MULTI-PAGE BOOKS: SEPARATE FINAL SUMMARY SHEET */}
      {isMultiPage && (
        <Page size="A4" style={styles.page}>
          <View style={styles.slimHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image src="/logo.png" style={styles.slimLogo} />
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: NAVY }}>
                {businessName} — Job Bill Summary
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8, color: '#4B5563' }}>
                Bill No: {book.billNumber} | Customer: {book.customerId?.name || ''}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Summary of All Pages
          </Text>

          {/* Table of Pages & Totals */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={{ width: '10%', textAlign: 'center' }}>No.</Text>
              <Text style={{ width: '65%', paddingLeft: 4 }}>Page Title / Work Description</Text>
              <Text style={{ width: '25%', textAlign: 'right', paddingRight: 8 }}>Page Total (Rs.)</Text>
            </View>
            {book.pages.map((p, idx) => (
              <View
                key={p._id || idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.zebraRow : {}]}
              >
                <Text style={{ width: '10%', textAlign: 'center' }}>{idx + 1}</Text>
                <Text style={{ width: '65%', paddingLeft: 4, fontWeight: 'bold', color: NAVY }}>
                  {p.title || `Page ${idx + 1}`}
                </Text>
                <Text style={{ width: '25%', textAlign: 'right', paddingRight: 8 }}>
                  Rs. {formatIndianNumber(p.pageTotal || 0, 2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary & Conditions Block */}
          <View style={styles.summaryBlock}>
            <View style={styles.summaryGrid}>
              {/* Conditions */}
              <View style={styles.conditionsBox}>
                <Text style={styles.conditionsHeading}>Terms & Conditions:</Text>
                {conditionsList.map((cond, idx) => (
                  <Text key={idx} style={styles.conditionItem}>
                    {idx + 1}. {cond}
                  </Text>
                ))}
              </View>

              {/* Totals */}
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text style={{ color: '#4B5563' }}>Grand Total:</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 10 }}>
                    Rs. {formatIndianNumber(book.grandTotal, 2)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={{ color: '#4B5563' }}>Paid Amount:</Text>
                  <Text style={{ fontWeight: 'bold', color: '#065F46' }}>
                    Rs. {formatIndianNumber(book.paidTotal, 2)}
                  </Text>
                </View>
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Balance Due:</Text>
                  <Text style={styles.grandTotalVal}>
                    Rs. {formatIndianNumber(book.balance, 2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Signatures */}
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <Text>Customer Signature</Text>
              </View>
              <View style={styles.signatureBox}>
                <Text>For, Deep Furniture</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Deep Furniture — Carpentry & Interior Job Works</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
