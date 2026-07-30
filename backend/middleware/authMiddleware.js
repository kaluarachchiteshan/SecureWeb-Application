import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secureweb_super_secret_jwt_key_2026_cybersecurity_monitoring');
      
      // If DB is connected, fetch user from DB; else use token payload
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      } else {
        req.user = { _id: decoded.id, id: decoded.id, name: decoded.name || 'User', email: decoded.email, role: decoded.role || 'user' };
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  // API Key Authentication Support
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    try {
      const user = await User.findOne({ apiKey: apiKeyHeader }).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Pass through
    }
  }

  if (!token && !apiKeyHeader) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token or API key provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};
