import Website from '../models/Website.js';
import ScanResult from '../models/ScanResult.js';
import Alert from '../models/Alert.js';

// In-memory fallback storage if MongoDB is not running locally
const memoryWebsites = [];

// @desc    Get user's monitored websites with search & pagination
// @route   GET /api/websites
export const getWebsites = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    try {
      const query = { userId };
      if (search) {
        query.$or = [
          { websiteName: { $regex: search, $options: 'i' } },
          { websiteURL: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Website.countDocuments(query);
      const websites = await Website.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return res.json({
        success: true,
        count: websites.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit) || 1,
        websites,
      });
    } catch (dbErr) {
      // Fallback in-memory query
      let userSites = memoryWebsites.filter((w) => String(w.userId) === String(userId));
      if (search) {
        const term = search.toLowerCase();
        userSites = userSites.filter(
          (w) => w.websiteName.toLowerCase().includes(term) || w.websiteURL.toLowerCase().includes(term)
        );
      }
      return res.json({
        success: true,
        count: userSites.length,
        total: userSites.length,
        page: 1,
        pages: 1,
        websites: userSites,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single website by ID
// @route   GET /api/websites/:id
export const getWebsiteById = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      return res.json({ success: true, website });
    } catch (dbErr) {
      const website = memoryWebsites.find((w) => String(w._id) === String(id));
      if (!website) return res.status(404).json({ success: false, message: 'Website not found' });
      return res.json({ success: true, website });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new website to monitor
// @route   POST /api/websites
export const addWebsite = async (req, res) => {
  try {
    const { websiteName, websiteURL, description } = req.body;

    if (!websiteName || !websiteURL) {
      return res.status(400).json({ success: false, message: 'Please provide website name and website URL' });
    }

    // Format URL
    let formattedURL = websiteURL.trim();
    if (!formattedURL.startsWith('http://') && !formattedURL.startsWith('https://')) {
      formattedURL = 'https://' + formattedURL;
    }

    try {
      const website = await Website.create({
        userId: req.user._id,
        websiteName: websiteName.trim(),
        websiteURL: formattedURL,
        description: description || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Website added to monitoring dashboard',
        website,
      });
    } catch (dbErr) {
      const newSite = {
        _id: `site_${Date.now()}`,
        userId: req.user._id,
        websiteName: websiteName.trim(),
        websiteURL: formattedURL,
        description: description || '',
        lastScannedAt: null,
        lastSecurityScore: null,
        lastRiskLevel: null,
        createdAt: new Date(),
      };
      memoryWebsites.unshift(newSite);
      return res.status(201).json({
        success: true,
        message: 'Website added to monitoring dashboard',
        website: newSite,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update website details
// @route   PUT /api/websites/:id
export const updateWebsite = async (req, res) => {
  try {
    const { websiteName, websiteURL, description } = req.body;
    const { id } = req.params;

    try {
      let website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }

      if (String(website.userId) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this website' });
      }

      if (websiteName) website.websiteName = websiteName.trim();
      if (websiteURL) {
        let formattedURL = websiteURL.trim();
        if (!formattedURL.startsWith('http://') && !formattedURL.startsWith('https://')) {
          formattedURL = 'https://' + formattedURL;
        }
        website.websiteURL = formattedURL;
      }
      if (description !== undefined) website.description = description;

      await website.save();

      return res.json({
        success: true,
        message: 'Website details updated successfully',
        website,
      });
    } catch (dbErr) {
      const index = memoryWebsites.findIndex((w) => String(w._id) === String(id));
      if (index === -1) return res.status(404).json({ success: false, message: 'Website not found' });

      if (websiteName) memoryWebsites[index].websiteName = websiteName;
      if (websiteURL) memoryWebsites[index].websiteURL = websiteURL;
      if (description !== undefined) memoryWebsites[index].description = description;

      return res.json({
        success: true,
        message: 'Website updated successfully',
        website: memoryWebsites[index],
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a monitored website
// @route   DELETE /api/websites/:id
export const deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const website = await Website.findById(id);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }

      if (String(website.userId) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this website' });
      }

      await Website.findByIdAndDelete(id);
      await ScanResult.deleteMany({ websiteId: id });
      await Alert.deleteMany({ websiteId: id });

      return res.json({ success: true, message: 'Website and associated scan history deleted' });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Website deleted' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate dynamic public SVG security badge for website
// @route   GET /api/websites/:id/badge.svg
export const getWebsiteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    let score = 90;

    try {
      const website = await Website.findById(id);
      if (website && website.lastSecurityScore !== undefined) {
        score = website.lastSecurityScore;
      }
    } catch (e) {
      // Fallback score
    }

    let grade = 'A+';
    let color = '#10b981'; // Emerald
    if (score < 40) { grade = 'F'; color = '#ef4444'; }
    else if (score < 60) { grade = 'D'; color = '#f97316'; }
    else if (score < 75) { grade = 'C'; color = '#eab308'; }
    else if (score < 90) { grade = 'B'; color = '#06b6d4'; }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="30" viewBox="0 0 220 30" fill="none">
  <rect width="220" height="30" rx="6" fill="#070b15" stroke="#1e293b" stroke-width="1"/>
  <rect x="1" y="1" width="105" height="28" rx="5" fill="#0f172a"/>
  <text x="12" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#06b6d4" letter-spacing="0.5">SECUREWEB</text>
  <rect x="110" y="5" width="105" height="20" rx="4" fill="${color}"/>
  <text x="162" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">${score}/100 Grade ${grade}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'max-age=300'); // Cache for 5 mins
    return res.send(svg);
  } catch (error) {
    res.status(500).send('<svg><text>Badge Error</text></svg>');
  }
};
