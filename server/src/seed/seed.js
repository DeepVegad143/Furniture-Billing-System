import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { CatalogItem } from '../models/CatalogItem.js';
import { Customer } from '../models/Customer.js';
import { Book } from '../models/Book.js';
import { RateQuote } from '../models/RateQuote.js';
import { Counter } from '../models/Counter.js';
import { calculateBookTotals } from '../../../calc/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load seed files from server/seed/ or current dir
function loadSeedFile(filename) {
  const rootSeedPath = path.resolve(__dirname, '../../seed', filename);
  if (fs.existsSync(rootSeedPath)) {
    return JSON.parse(fs.readFileSync(rootSeedPath, 'utf-8'));
  }
  const localSeedPath = path.resolve(__dirname, filename);
  if (fs.existsSync(localSeedPath)) {
    return JSON.parse(fs.readFileSync(localSeedPath, 'utf-8'));
  }
  throw new Error(`Seed file ${filename} not found in ${rootSeedPath} or ${localSeedPath}`);
}

const catalogData = loadSeedFile('catalog.json');
const conditionsData = loadSeedFile('conditions.json');

/**
 * Seed or update the catalog items for a given user.
 */
export async function seedCatalogForUser(userId) {
  const existingCount = await CatalogItem.countDocuments({ ownerId: userId });
  if (existingCount > 0) {
    return; // Already initialized, keep user's customized rates
  }

  const items = catalogData.map(item => ({
    ...item,
    ownerId: userId,
  }));
  await CatalogItem.insertMany(items);
}

/**
 * Seed settings for a given user.
 */
export async function seedSettingsForUser(userId, businessName = 'Deep Furniture') {
  const existing = await Settings.findOne({ ownerId: userId });
  if (existing) return existing;

  return await Settings.create({
    ownerId: userId,
    businessName,
    phone: '99799 09987',
    address: 'Near Patel Estate, GIDC, Surat, Gujarat',
    gstin: '24AAACD1234E1Z5',
    upiId: 'deepfurniture@upi',
    conditions: conditionsData,
  });
}

/**
 * Wipe and re-seed all demo user data.
 */
export async function resetDemoData(demoUserId) {
  // Remove existing demo data
  await Promise.all([
    Settings.deleteMany({ ownerId: demoUserId }),
    CatalogItem.deleteMany({ ownerId: demoUserId }),
    Customer.deleteMany({ ownerId: demoUserId }),
    Book.deleteMany({ ownerId: demoUserId }),
    RateQuote.deleteMany({ ownerId: demoUserId }),
    Counter.deleteMany({ ownerId: demoUserId }),
  ]);

  // Seed settings and catalog
  await seedSettingsForUser(demoUserId, 'Deep Furniture');
  const catalogItemsToInsert = catalogData.map(item => ({
    ...item,
    ownerId: demoUserId,
  }));
  const catalogDocs = await CatalogItem.insertMany(catalogItemsToInsert);

  // Initialize counter for demo user
  await Counter.create({
    ownerId: demoUserId,
    name: 'billNumber',
    seq: 14,
  });

  // 8 fake customers with obviously fake 90000 0000X phone pattern
  const fakeCustomersData = [
    { name: 'Ramesh Patel', phone: '90000 00001', address: 'B-204, Shivalik Residency, Adajan, Surat', notes: 'Prefers teak wood finish. Master bedroom renovation.' },
    { name: 'Pravin Shah', phone: '90000 00002', address: '45, Radhe Shyam Society, Pal, Surat', notes: 'Full 3BHK flat carpentry job.' },
    { name: 'Sanjaybhai Mistry', phone: '90000 00003', address: '12, Mahadev Nagar, Katargam, Surat', notes: 'Kitchen cabinets and trolley work.' },
    { name: 'Hitesh Prajapati', phone: '90000 00004', address: 'C-501, Green City, Vesu, Surat', notes: 'Wardrobe sliding doors and shoe rack.' },
    { name: 'Kiritbhai Desai', phone: '90000 00005', address: 'Plot 78, Shanti Kunj, Varachha, Surat', notes: 'TV unit with charcoal louvers.' },
    { name: 'Dineshbhai Panchal', phone: '90000 00006', address: 'A-102, Royal Palace, Althan, Surat', notes: 'Safety door and bedroom interior.' },
    { name: 'Mukeshbhai Mehta', phone: '90000 00007', address: '33, Krishna Bunglows, Piplod, Surat', notes: 'Commercial showroom display units.' },
    { name: 'Jayeshbhai Suthar', phone: '90000 00008', address: 'D-303, Galaxy Heights, Rander, Surat', notes: 'Dining table and pooja mandir partition.' },
  ];

  const customerDocs = await Customer.insertMany(
    fakeCustomersData.map(c => ({ ...c, ownerId: demoUserId }))
  );

  // Create demo books with realistic items and payment states
  const c0 = customerDocs[0]; // Ramesh Patel
  const c1 = customerDocs[1]; // Pravin Shah
  const c2 = customerDocs[2]; // Sanjaybhai
  const c3 = customerDocs[3]; // Hitesh

  const getCatId = (name) => {
    const found = catalogDocs.find(d => d.nameEn.toLowerCase() === name.toLowerCase());
    return found ? found._id : catalogDocs[0]._id;
  };

  // Book 1: Ramesh Patel - 2 Pages - Partial payment
  const book1RawPages = [
    {
      title: 'Master Bedroom',
      items: [
        {
          catalogItemId: getCatId('Cupboard - Laminate/Lacquer'),
          nameEn: 'Cupboard - Laminate/Lacquer',
          nameGu: 'કબાટ - લેમિનેટ / લેકર',
          unit: 'SQ.FT',
          length: 114,
          width: 84,
          qty: 1,
          rate: 225,
          amount: 14962.5,
          isCustom: false,
          note: 'Gloss laminate inside & outside',
        },
        {
          catalogItemId: getCatId('Double Bed'),
          nameEn: 'Double Bed',
          nameGu: 'ડબલ બેડ',
          unit: 'SQ.FT',
          length: 78,
          width: 72,
          qty: 1,
          rate: 205,
          amount: 7995,
          isCustom: false,
          note: 'Hydraulic lift storage',
        },
        {
          catalogItemId: getCatId('Side Box – 18” To 24”'),
          nameEn: 'Side Box – 18” To 24”',
          nameGu: 'સાઈડ બોક્સ (૧૮" થી ૨૪")',
          unit: 'NOS',
          length: 0,
          width: 0,
          qty: 2,
          rate: 2750,
          amount: 5500,
          isCustom: false,
          note: 'With soft close channels',
        },
      ],
    },
    {
      title: 'Kids Bedroom',
      items: [
        {
          catalogItemId: getCatId('Cupboard - Laminate/Lacquer'),
          nameEn: 'Cupboard - Laminate/Lacquer',
          nameGu: 'કબાટ - લેમિનેટ / લેકર',
          unit: 'SQ.FT',
          length: 84,
          width: 78,
          qty: 1,
          rate: 225,
          amount: 10237.5,
          isCustom: false,
          note: 'Dual color laminate',
        },
        {
          catalogItemId: getCatId('T.V. Unit'),
          nameEn: 'T.V. Unit',
          nameGu: 'ટી.વી. યુનિટ',
          unit: 'SQ.FT',
          length: 60,
          width: 30,
          qty: 1,
          rate: 230,
          amount: 2875,
          isCustom: false,
          note: 'Study table with book shelf',
        },
      ],
    },
  ];

  const book1Payments = [
    { amount: 15000, date: '2026-09-20', note: 'Advance token payment' },
    { amount: 10000, date: '2026-10-05', note: 'Second withdrawal' },
  ];

  const b1Calc = calculateBookTotals(book1RawPages, book1Payments);

  await Book.create({
    ownerId: demoUserId,
    customerId: c0._id,
    title: 'Flat 204 Full Interior Carpentry',
    date: '2026-09-18',
    billNumber: 'DF-0010',
    pages: b1Calc.computedPages,
    payments: book1Payments,
    grandTotal: b1Calc.grandTotal,
    paidTotal: b1Calc.paidTotal,
    balance: b1Calc.balance,
    status: b1Calc.status,
  });

  // Book 2: Pravin Shah - 3 Pages - Paid
  const book2RawPages = [
    {
      title: 'Kitchen Trolley & Cabinet Work',
      items: [
        {
          catalogItemId: getCatId('Kitchen-Cupboard'),
          nameEn: 'Kitchen-Cupboard',
          nameGu: 'કિચન કબાટ',
          unit: 'SQ.FT',
          length: 144,
          width: 30,
          qty: 1,
          rate: 225,
          amount: 6750,
          isCustom: false,
        },
        {
          catalogItemId: getCatId('Kitchen-Basket'),
          nameEn: 'Kitchen-Basket',
          nameGu: 'કિચન બાસ્કેટ',
          unit: 'NOS',
          length: 0,
          width: 0,
          qty: 6,
          rate: 500,
          amount: 3000,
          isCustom: false,
        },
        {
          catalogItemId: getCatId('Tandem Box Drawer'),
          nameEn: 'Tandem Box Drawer',
          nameGu: 'ટેન્ડમ બોક્સ ડ્રોઅર',
          unit: 'NOS',
          length: 0,
          width: 0,
          qty: 4,
          rate: 1350,
          amount: 5400,
          isCustom: false,
        },
      ],
    },
    {
      title: 'Entrance & Living Room',
      items: [
        {
          catalogItemId: getCatId('Main Door'),
          nameEn: 'Main Door',
          nameGu: 'મેઈન ડોર',
          unit: 'SQ.FT',
          length: 84,
          width: 42,
          qty: 1,
          rate: 230,
          amount: 5635,
          isCustom: false,
        },
        {
          catalogItemId: getCatId('Door Lock – Roje Lock'),
          nameEn: 'Door Lock – Roje Lock',
          nameGu: 'ડોર લોક - રોઝ લોક',
          unit: 'NOS',
          length: 0,
          width: 0,
          qty: 1,
          rate: 750,
          amount: 750,
          isCustom: false,
        },
      ],
    },
  ];

  const b2TempCalc = calculateBookTotals(book2RawPages, []);
  const book2Payments = [
    { amount: b2TempCalc.grandTotal, date: '2026-09-28', note: 'Full settlement in cash' },
  ];
  const b2Calc = calculateBookTotals(book2RawPages, book2Payments);

  await Book.create({
    ownerId: demoUserId,
    customerId: c1._id,
    title: 'Kitchen & Main Door Job',
    date: '2026-09-15',
    billNumber: 'DF-0011',
    pages: b2Calc.computedPages,
    payments: book2Payments,
    grandTotal: b2Calc.grandTotal,
    paidTotal: b2Calc.paidTotal,
    balance: b2Calc.balance,
    status: b2Calc.status,
  });

  // Book 3: Sanjaybhai Mistry - Pending (no payment yet)
  const book3RawPages = [
    {
      title: 'Hall Partition & TV Unit',
      items: [
        {
          catalogItemId: getCatId('T.V. Unit'),
          nameEn: 'T.V. Unit',
          nameGu: 'ટી.વી. યુનિટ',
          unit: 'SQ.FT',
          length: 96,
          width: 72,
          qty: 1,
          rate: 230,
          amount: 11040,
          isCustom: false,
        },
        {
          catalogItemId: getCatId('Penelling - Box Type – Depth 2” To 6”'),
          nameEn: 'Penelling - Box Type – Depth 2” To 6”',
          nameGu: 'પેનલિંગ બોક્સ ટાઈપ (૨" થી ૬")',
          unit: 'SQ.FT',
          length: 96,
          width: 36,
          qty: 1,
          rate: 225,
          amount: 5400,
          isCustom: false,
        },
      ],
    },
  ];
  const b3Calc = calculateBookTotals(book3RawPages, []);

  await Book.create({
    ownerId: demoUserId,
    customerId: c2._id,
    title: 'Living Room Louvers & TV Wall',
    date: '2026-10-12',
    billNumber: 'DF-0012',
    pages: b3Calc.computedPages,
    payments: [],
    grandTotal: b3Calc.grandTotal,
    paidTotal: b3Calc.paidTotal,
    balance: b3Calc.balance,
    status: b3Calc.status,
  });

  // Saved rate quotes for demo customers
  await RateQuote.create({
    ownerId: demoUserId,
    customerId: c0._id,
    customerSnapshot: {
      name: c0.name,
      phone: c0.phone,
      address: c0.address,
    },
    date: '2026-09-10',
    quoteNumber: 'RQ-0001',
    items: catalogDocs.slice(0, 10).map(item => ({
      nameEn: item.nameEn,
      nameGu: item.nameGu,
      unit: item.unit,
      rate: item.defaultRate,
    })),
  });

  await RateQuote.create({
    ownerId: demoUserId,
    customerId: c3._id,
    customerSnapshot: {
      name: c3.name,
      phone: c3.phone,
      address: c3.address,
    },
    date: '2026-10-02',
    quoteNumber: 'RQ-0002',
    items: catalogDocs.map(item => ({
      nameEn: item.nameEn,
      nameGu: item.nameGu,
      unit: item.unit,
      rate: item.defaultRate,
    })),
  });

  await User.findByIdAndUpdate(demoUserId, { demoLastReset: new Date() });
}

/**
 * Main seed function: creates owner and demo users and initial data.
 */
export async function seedAll() {
  // 1. Owner User
  const ownerUsername = env.OWNER_USERNAME.toLowerCase().trim();
  let owner = (await User.findOne({ role: 'owner' })) || (await User.findOne({ username: ownerUsername }));
  const ownerPasswordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);

  if (!owner) {
    owner = await User.create({
      username: ownerUsername,
      passwordHash: ownerPasswordHash,
      role: 'owner',
      language: 'en',
    });
  } else {
    owner.username = ownerUsername;
    owner.passwordHash = ownerPasswordHash;
    await owner.save();
  }

  // Seed owner settings and catalog
  await seedSettingsForUser(owner._id, 'Deep Furniture');
  await seedCatalogForUser(owner._id);

  // Initialize counter for owner if needed
  const ownerCounter = await Counter.findOne({ ownerId: owner._id, name: 'billNumber' });
  if (!ownerCounter) {
    await Counter.create({
      ownerId: owner._id,
      name: 'billNumber',
      seq: 0,
    });
  }

  // 2. Demo User
  const demoUsername = env.DEMO_USERNAME.toLowerCase().trim();
  let demo = await User.findOne({ username: demoUsername });
  const demoPasswordHash = await bcrypt.hash(env.DEMO_PASSWORD, 10);

  if (!demo) {
    demo = await User.create({
      username: demoUsername,
      passwordHash: demoPasswordHash,
      role: 'demo',
      language: 'en',
      demoLastReset: new Date(),
    });
    await resetDemoData(demo._id);
  } else {
    demo.passwordHash = demoPasswordHash;
    await demo.save();
    await resetDemoData(demo._id);
  }

  // Also migrate any existing books belonging to any user that still have feet measurements (< 25 ft)
  const allBooks = await Book.find({});
  for (const b of allBooks) {
    let changed = false;
    for (const page of b.pages) {
      for (const item of page.items) {
        if (item.unit === 'SQ.FT' && item.length > 0 && item.length < 25 && item.width > 0 && item.width < 25) {
          item.length = Math.round(item.length * 12 * 100) / 100;
          item.width = Math.round(item.width * 12 * 100) / 100;
          changed = true;
        } else if (item.unit === 'R.F' && item.length > 0 && item.length < 50) {
          item.length = Math.round(item.length * 12 * 100) / 100;
          changed = true;
        }
      }
    }
    if (changed) {
      const calc = calculateBookTotals(b.pages, b.payments);
      b.pages = calc.computedPages;
      b.grandTotal = calc.grandTotal;
      b.paidTotal = calc.paidTotal;
      b.balance = calc.balance;
      b.status = calc.status;
      await b.save();
    }
  }
}

// Standalone execution
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedAll();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed error:', err);
      process.exit(1);
    }
  })();
}
