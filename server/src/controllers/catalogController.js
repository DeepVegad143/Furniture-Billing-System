import { z } from 'zod';
import { CatalogItem } from '../models/CatalogItem.js';
import { seedCatalogForUser } from '../seed/seed.js';

const catalogItemSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').trim(),
  nameGu: z.string().trim().default(''),
  unit: z.enum(['SQ.FT', 'R.F', 'NOS']),
  defaultRate: z.number().min(0, 'Rate cannot be negative'),
  order: z.number().optional(),
  isActive: z.boolean().default(true),
});

export async function getCatalog(req, res, next) {
  try {
    let items = await CatalogItem.find({ ownerId: req.user.id }).sort({ order: 1, nameEn: 1 });

    if (items.length === 0) {
      await seedCatalogForUser(req.user.id);
      items = await CatalogItem.find({ ownerId: req.user.id }).sort({ order: 1, nameEn: 1 });
    }

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function createCatalogItem(req, res, next) {
  try {
    const data = catalogItemSchema.parse(req.body);

    const highestOrder = await CatalogItem.findOne({ ownerId: req.user.id })
      .sort({ order: -1 })
      .select('order');
    const order = data.order !== undefined ? data.order : (highestOrder ? highestOrder.order + 1 : 1);

    const item = await CatalogItem.create({
      ...data,
      order,
      ownerId: req.user.id,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
}

export async function updateCatalogItem(req, res, next) {
  try {
    const { id } = req.params;
    const data = catalogItemSchema.partial().parse(req.body);

    const item = await CatalogItem.findOneAndUpdate(
      { _id: id, ownerId: req.user.id },
      { $set: data },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, error: 'Catalog item not found' });
    }

    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
}

export async function deleteCatalogItem(req, res, next) {
  try {
    const { id } = req.params;

    const item = await CatalogItem.findOneAndDelete({ _id: id, ownerId: req.user.id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Catalog item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function reorderCatalog(req, res, next) {
  try {
    const { itemIds } = req.body; // Array of IDs in new order
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ success: false, error: 'itemIds array is required' });
    }

    const updates = itemIds.map((id, index) =>
      CatalogItem.updateOne({ _id: id, ownerId: req.user.id }, { $set: { order: index + 1 } })
    );

    await Promise.all(updates);
    const items = await CatalogItem.find({ ownerId: req.user.id }).sort({ order: 1 });

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}
