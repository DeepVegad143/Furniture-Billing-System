import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Generate a JWT for a user with 30 days lifetime.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Auth middleware verifying Bearer JWT and isolating data strictly by req.user.id.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Malformed token' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    // Attach verified user to request
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      username: user.username,
      role: user.role,
      language: user.language || 'en',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication token' });
  }
}
