/**
 * Shared calculation module for Deep Furniture Billing & Rate-Quote System.
 * Pure functions used across both client and server.
 */

export const MEASURE_UNIT = 'in'; // Default measurement unit: 'in' | 'ft'

/**
 * Accurately round a number to 2 decimal places without floating point precision quirks.
 * @param {number} num 
 * @returns {number}
 */
export function round2(num) {
  if (num === null || num === undefined || isNaN(num)) return 0;
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Registry of custom calculation overrides for specific catalog items.
 * Allows adding specialized pricing logic for items in the future without changing core code.
 */
export const calcRules = {
  // Example override hook structure:
  // 'CUPBOARD_SPECIAL': (item, measureUnit) => { ... }
};

/**
 * Calculate amount and area for a single job item.
 * 
 * Rules:
 * - Inside Laminate: Sheet count, sq. feet = sheets * 32, total = price * sq. feet
 * - R.F (Running Feet): length (in) converted into feet (length / 12), total = feet * price
 * - SQ.FT: area = (length × width) ÷ 144 (when measureUnit === 'in') or length × width (when measureUnit === 'ft')
 *          amount = area × qty × rate
 * - NOS:   amount = qty × rate
 * - Custom rules check registry first
 * 
 * @param {Object} item 
 * @param {'ft' | 'in'} [measureUnit='in']
 * @returns {{ amount: number, area: number, sheets?: number }}
 */
export function calculateItemAmount(item, measureUnit = MEASURE_UNIT) {
  if (!item) return { amount: 0, area: 0 };

  const { catalogItemKey, unit = 'SQ.FT', length = 0, width = 0, qty = 1, rate = 0, sheets } = item;

  const numLength = Number(length) || 0;
  const numWidth = Number(width) || 0;
  const numQty = Number(qty) || 0;
  const numRate = Number(rate) || 0;

  // Check if there is a registered override hook for this item
  if (catalogItemKey && typeof calcRules[catalogItemKey] === 'function') {
    const customResult = calcRules[catalogItemKey](item, measureUnit);
    return {
      amount: round2(customResult.amount),
      area: round2(customResult.area || 0)
    };
  }

  const name = (item.nameEn || item.name || '').toUpperCase().trim();
  const normalizedUnit = (unit || '').toUpperCase().trim();

  // SPECIAL CASE 1: Inside Laminate
  // Rule: sq. feet = sheets * 32, total = price * sq. feet
  const isInsideLaminate = item.isInsideLaminate === true ||
    (name.includes('INSIDE') && name.includes('LAMINATE'));

  if (isInsideLaminate) {
    const numSheets = sheets !== undefined ? Number(sheets) || 0 : (numQty > 0 ? numQty : 0);
    const sqft = round2(numSheets * 32);
    const amount = round2(sqft * numRate);
    return {
      amount,
      area: sqft,
      sheets: numSheets
    };
  }

  // SPECIAL CASE 2: Running Feet (RF)
  // Rule: length in inch converted to feet (length / 12), total = feet * price
  const isRF = normalizedUnit === 'R.F' || normalizedUnit === 'RF' || normalizedUnit === 'R. F' || name.includes('(RF)');

  if (isRF) {
    const feet = measureUnit === 'in' ? (numLength > 0 ? round2(numLength / 12) : 0) : numLength;
    const effectiveQty = numQty > 0 ? numQty : 1;
    const amount = round2(feet * numRate * effectiveQty);
    return {
      amount,
      area: feet
    };
  }

  let area = 0;
  let amount = 0;

  switch (normalizedUnit) {
    case 'SQ.FT':
    case 'SQFT':
    case 'SQ. FT': {
      const rawArea = numLength * numWidth;
      area = measureUnit === 'in' ? (rawArea > 0 ? round2(rawArea / 144) : 0) : rawArea;
      amount = area * numQty * numRate;
      break;
    }
    case 'NOS':
    case 'NO':
    case 'NOS.': {
      amount = numQty * numRate;
      area = 0;
      break;
    }
    default: {
      if (numLength > 0 && numWidth > 0) {
        const rawArea = numLength * numWidth;
        area = measureUnit === 'in' ? (rawArea > 0 ? round2(rawArea / 144) : 0) : rawArea;
        amount = area * numQty * numRate;
      } else if (numLength > 0) {
        const effLength = measureUnit === 'in' ? (numLength > 0 ? round2(numLength / 12) : 0) : numLength;
        amount = effLength * numQty * numRate;
      } else {
        amount = numQty * numRate;
      }
      break;
    }
  }

  return {
    amount: round2(amount),
    area: round2(area)
  };
}

/**
 * Calculate total for a single page in a book.
 * @param {Object} page 
 * @param {'ft' | 'in'} [measureUnit='ft']
 * @returns {number}
 */
export function calculatePageTotal(page, measureUnit = MEASURE_UNIT) {
  if (!page || !Array.isArray(page.items)) return 0;

  const total = page.items.reduce((sum, item) => {
    const { amount } = calculateItemAmount(item, measureUnit);
    return sum + amount;
  }, 0);

  return round2(total);
}

/**
 * Recomputes all items, page totals, grand totals, and payment status for an entire book.
 * Always used on the server on save to ensure data integrity, and in the client for live totals.
 * 
 * @param {Array} pages 
 * @param {Array} [payments=[]] 
 * @param {'ft' | 'in'} [measureUnit='ft']
 * @returns {{
 *   computedPages: Array,
 *   grandTotal: number,
 *   paidTotal: number,
 *   balance: number,
 *   status: 'Pending' | 'Partial' | 'Paid'
 * }}
 */
export function calculateBookTotals(pages = [], payments = [], measureUnit = MEASURE_UNIT) {
  let grandTotal = 0;

  const computedPages = (pages || []).map(page => {
    let pageTotal = 0;
    const computedItems = (page.items || []).map(item => {
      const { amount, area, sheets } = calculateItemAmount(item, measureUnit);
      pageTotal += amount;
      return {
        ...item,
        amount,
        area: area > 0 ? area : undefined,
        ...(sheets !== undefined ? { sheets } : {})
      };
    });

    const roundedPageTotal = round2(pageTotal);
    grandTotal += roundedPageTotal;

    return {
      ...page,
      items: computedItems,
      pageTotal: roundedPageTotal
    };
  });

  const roundedGrandTotal = round2(grandTotal);

  const paidTotal = round2(
    (payments || []).reduce((sum, payment) => {
      const amt = Number(payment.amount) || 0;
      return sum + amt;
    }, 0)
  );

  const balance = round2(roundedGrandTotal - paidTotal);

  let status = 'Pending';
  if (roundedGrandTotal > 0) {
    if (paidTotal >= roundedGrandTotal) {
      status = 'Paid';
    } else if (paidTotal > 0) {
      status = 'Partial';
    } else {
      status = 'Pending';
    }
  } else if (paidTotal > 0) {
    status = 'Paid';
  }

  return {
    computedPages,
    grandTotal: roundedGrandTotal,
    paidTotal,
    balance,
    status
  };
}

/**
 * Format a number using Indian numbering system (en-IN).
 * @param {number} num 
 * @param {number} [decimals=2] 
 * @returns {string}
 */
export function formatIndianNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const n = Number(num);
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format currency with ₹ and Indian grouping.
 * @param {number} amount 
 * @param {boolean} [includeSymbol=true] 
 * @returns {string}
 */
export function formatCurrency(amount, includeSymbol = true) {
  const formatted = formatIndianNumber(round2(amount), 2);
  return includeSymbol ? `₹${formatted}` : formatted;
}
