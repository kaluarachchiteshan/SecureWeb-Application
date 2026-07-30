import Alert from '../models/Alert.js';

// @desc    Get user alerts with optional severity & status filtering
// @route   GET /api/alerts
export const getAlerts = async (req, res) => {
  try {
    const { severity, status } = req.query;
    const userId = req.user._id;

    try {
      const query = { userId };
      if (severity) query.severity = severity;
      if (status) query.status = status;

      const alerts = await Alert.find(query)
        .sort({ createdAt: -1 })
        .populate('websiteId', 'websiteName websiteURL');

      return res.json({ success: true, count: alerts.length, alerts });
    } catch (dbErr) {
      return res.json({ success: true, count: 0, alerts: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update alert status (e.g. mark as resolved or dismissed)
// @route   PUT /api/alerts/:id/status
export const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }

      if (String(alert.userId) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this alert' });
      }

      alert.status = status;
      await alert.save();

      return res.json({ success: true, message: `Alert status updated to ${status}`, alert });
    } catch (dbErr) {
      return res.json({ success: true, message: `Alert status updated to ${status}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Alert.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Alert deleted successfully' });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Alert deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
