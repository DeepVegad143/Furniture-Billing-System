import { z } from 'zod';
import { Settings } from '../models/Settings.js';
import { seedSettingsForUser } from '../seed/seed.js';

const updateSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').trim(),
  phone: z.string().trim().default(''),
  address: z.string().trim().default(''),
  gstin: z.string().trim().optional(),
  upiId: z.string().trim().optional(),
  conditions: z.object({
    en: z.array(z.string()).default([]),
    gu: z.array(z.string()).default([]),
  }).optional(),
});

export async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne({ ownerId: req.user.id });
    if (!settings) {
      settings = await seedSettingsForUser(req.user.id);
    } else if (settings.phone === '98765 43210') {
      settings.phone = '99799 09987';
      await Settings.updateOne({ _id: settings._id }, { $set: { phone: '99799 09987' } });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const settings = await Settings.findOneAndUpdate(
      { ownerId: req.user.id },
      { $set: data },
      { new: true, upsert: true }
    );

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}
