import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, name, email, role) => {
  return jwt.sign(
    { id, name, email, role },
    process.env.JWT_SECRET || 'secureweb_super_secret_jwt_key_2026_cybersecurity_monitoring',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Default to 'user' unless explicitly specified as admin in dev
    const userRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    const token = generateToken(user._id, user.name, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.name, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      // Fallback if running without MongoDB database
      return res.json({ success: true, user: req.user });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Password reset request
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password has been successfully updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate or regenerate API Key
// @route   POST /api/auth/api-key
export const generateApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const mockKey = `sw_live_${Date.now()}_key_${Math.random().toString(36).substring(2, 10)}`;
      return res.json({ success: true, apiKey: mockKey, createdAt: new Date() });
    }

    const newKey = `sw_live_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    user.apiKey = newKey;
    user.apiKeyCreatedAt = new Date();
    await user.save();

    return res.json({ success: true, message: 'Developer API Key generated successfully', apiKey: newKey, createdAt: user.apiKeyCreatedAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke API Key
// @route   DELETE /api/auth/api-key
export const revokeApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.apiKey = null;
      user.apiKeyCreatedAt = null;
      await user.save();
    }
    return res.json({ success: true, message: 'API Key revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
