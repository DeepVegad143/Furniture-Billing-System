import ExcelJS from 'exceljs';
import { Customer } from '../models/Customer.js';
import { Book } from '../models/Book.js';
import { RateQuote } from '../models/RateQuote.js';
import { Settings } from '../models/Settings.js';

export async function exportToExcel(req, res, next) {
  try {
    const ownerId = req.user.id;

    const [settings, customers, books, quotes] = await Promise.all([
      Settings.findOne({ ownerId }).lean(),
      Customer.find({ ownerId }).sort({ createdAt: 1 }).lean(),
      Book.find({ ownerId }).populate('customerId', 'name phone').sort({ createdAt: 1 }).lean(),
      RateQuote.find({ ownerId }).sort({ createdAt: 1 }).lean(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = settings?.businessName || 'Deep Furniture';
    workbook.created = new Date();

    // 1. Customers Sheet
    const custSheet = workbook.addWorksheet('Customers');
    custSheet.columns = [
      { header: 'ID', key: '_id', width: 26 },
      { header: 'Customer Name', key: 'name', width: 25 },
      { header: 'Phone Number', key: 'phone', width: 18 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created Date', key: 'createdAt', width: 20 },
    ];
    customers.forEach(c => {
      custSheet.addRow({
        _id: c._id.toString(),
        name: c.name,
        phone: c.phone,
        address: c.address || '',
        notes: c.notes || '',
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
      });
    });

    // 2. Books Summary Sheet
    const bookSheet = workbook.addWorksheet('Books');
    bookSheet.columns = [
      { header: 'Bill Number', key: 'billNumber', width: 16 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Customer Phone', key: 'customerPhone', width: 18 },
      { header: 'Job Title', key: 'title', width: 30 },
      { header: 'Bill Date', key: 'date', width: 15 },
      { header: 'Grand Total (₹)', key: 'grandTotal', width: 18 },
      { header: 'Paid Total (₹)', key: 'paidTotal', width: 18 },
      { header: 'Balance (₹)', key: 'balance', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
    ];
    books.forEach(b => {
      bookSheet.addRow({
        billNumber: b.billNumber,
        customerName: b.customerId?.name || 'Unknown',
        customerPhone: b.customerId?.phone || '',
        title: b.title || '',
        date: b.date,
        grandTotal: b.grandTotal,
        paidTotal: b.paidTotal,
        balance: b.balance,
        status: b.status,
      });
    });

    // 3. Book Items Detail Sheet
    const itemSheet = workbook.addWorksheet('Book Items');
    itemSheet.columns = [
      { header: 'Bill Number', key: 'billNumber', width: 16 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Page Title', key: 'pageTitle', width: 25 },
      { header: 'Item Name (EN)', key: 'nameEn', width: 30 },
      { header: 'Item Name (GU)', key: 'nameGu', width: 30 },
      { header: 'Unit', key: 'unit', width: 12 },
      { header: 'Length (in)', key: 'length', width: 14 },
      { header: 'Width (in)', key: 'width', width: 14 },
      { header: 'Sq. Feet', key: 'area', width: 12 },
      { header: 'Qty', key: 'qty', width: 10 },
      { header: 'Rate (₹)', key: 'rate', width: 14 },
      { header: 'Amount (₹)', key: 'amount', width: 16 },
      { header: 'Notes', key: 'note', width: 25 },
    ];
    books.forEach(b => {
      b.pages.forEach(p => {
        p.items.forEach(item => {
          const isInsideLaminate = item.isInsideLaminate || (item.nameEn && /inside\s*[-–]?\s*laminate/i.test(item.nameEn));
          const calculatedArea =
            isInsideLaminate
              ? (item.sheets ? Number((item.sheets * 32).toFixed(2)) : (item.qty ? Number((item.qty * 32).toFixed(2)) : ''))
              : (item.unit === 'SQ.FT' && item.length > 0 && item.width > 0
                  ? Number(((item.length * item.width) / 144).toFixed(2))
                  : item.area || '');
          itemSheet.addRow({
            billNumber: b.billNumber,
            customerName: b.customerId?.name || '',
            pageTitle: p.title || '',
            nameEn: item.nameEn,
            nameGu: item.nameGu || '',
            unit: item.unit,
            length: item.length || '',
            width: item.width || '',
            area: calculatedArea,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
            note: item.note || '',
          });
        });
      });
    });

    // 4. Payments Sheet
    const paySheet = workbook.addWorksheet('Payments');
    paySheet.columns = [
      { header: 'Bill Number', key: 'billNumber', width: 16 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Payment Date', key: 'date', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 16 },
      { header: 'Note / Method', key: 'note', width: 30 },
    ];
    books.forEach(b => {
      (b.payments || []).forEach(p => {
        paySheet.addRow({
          billNumber: b.billNumber,
          customerName: b.customerId?.name || '',
          date: p.date,
          amount: p.amount,
          note: p.note || '',
        });
      });
    });

    // 5. Rate Quotes Sheet
    const quoteSheet = workbook.addWorksheet('Rate Quotes');
    quoteSheet.columns = [
      { header: 'Quote Number', key: 'quoteNumber', width: 16 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Items Count', key: 'itemsCount', width: 14 },
    ];
    quotes.forEach(q => {
      quoteSheet.addRow({
        quoteNumber: q.quoteNumber || '',
        customerName: q.customerSnapshot?.name || '',
        phone: q.customerSnapshot?.phone || '',
        date: q.date,
        itemsCount: q.items ? q.items.length : 0,
      });
    });

    // Style headers for all worksheets
    [custSheet, bookSheet, itemSheet, paySheet, quoteSheet].forEach(sheet => {
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B2750' }, // Navy brand color
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 24;
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `DeepFurniture_Backup_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}
