import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { resetDemoData } from '../seed/seed.js';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const cleanInput = username.trim().toLowerCase();
    const normalizedSpaces = cleanInput.replace(/\s+/g, ' ');
    const noSpaces = cleanInput.replace(/\s+/g, '');

    // 1. Direct lowercase match (covers "Dinesh Vegad", "dinesh vegad", "DINESH VEGAD", "  Dinesh Vegad  ")
    let user = await User.findOne({ username: normalizedSpaces });

    // 2. Case-insensitive regex fallback
    if (!user) {
      const escaped = normalizedSpaces.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
      user = await User.findOne({ username: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    }

    // 3. Space-agnostic fallback (e.g. "dineshvegad" or "DineshVegad")
    if (!user) {
      const allUsers = await User.find({}).lean();
      const matched = allUsers.find(u => u.username.replace(/\s+/g, '').toLowerCase() === noSpaces);
      if (matched) {
        user = await User.findById(matched._id);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    // If demo user, check for 24h lazy reset
    if (user.role === 'demo') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (!user.demoLastReset || user.demoLastReset < oneDayAgo) {
        await resetDemoData(user._id);
      }
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        language: user.language || 'en',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function demoLogin(req, res, next) {
  try {
    const demoUsername = env.DEMO_USERNAME.toLowerCase().trim();
    let demoUser = await User.findOne({ username: demoUsername });

    if (!demoUser) {
      // Auto-create demo user if not yet created
      const hash = await bcrypt.hash(env.DEMO_PASSWORD, 10);
      demoUser = await User.create({
        username: demoUsername,
        passwordHash: hash,
        role: 'demo',
        language: 'en',
        demoLastReset: new Date(),
      });
      await resetDemoData(demoUser._id);
    } else {
      // Lazy reset if older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (!demoUser.demoLastReset || demoUser.demoLastReset < oneDayAgo) {
        await resetDemoData(demoUser._id);
      }
    }

    const token = generateToken(demoUser);

    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id.toString(),
        username: demoUser.username,
        role: demoUser.role,
        language: demoUser.language || 'en',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        language: user.language || 'en',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateLanguage(req, res, next) {
  try {
    const { language } = req.body;
    if (!['en', 'gu'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Language must be "en" or "gu"' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { language },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        language: user.language,
      },
    });
  } catch (err) {
    next(err);
  }
}
