// ─────────────────────────────────────────────────────────────────────────────
// controllers/alternatives-controller.js
// ─────────────────────────────────────────────────────────────────────────────
const axios = require("axios");
 
const ALT_SERVICE_URL = "http://127.0.0.1:10000/api/v1/alternatives/suggest";
 
const suggestAlternatives = async (req, res) => {
  try {
    const payload = req.body;
 
    // Validate diet_type is one of accepted values
    const VALID_DIET_TYPES = ["omnivore", "vegetarian", "vegan", "keto", "paleo", "mediterranean"];
    if (!VALID_DIET_TYPES.includes(payload.diet_type)) {
      return res.status(400).json({
        success: false,
        message: `diet_type must be one of: ${VALID_DIET_TYPES.join(", ")}`,
      });
    }
 
    const response = await axios.post(ALT_SERVICE_URL, payload);
    res.json({ success: true, data: response.data });
  } catch (error) {
    const errData = error.response?.data;
    res.status(500).json({ success: false, message: "Failed to fetch alternatives", error: errData || error.message });
  }
};
 
module.exports = { suggestAlternatives };
 