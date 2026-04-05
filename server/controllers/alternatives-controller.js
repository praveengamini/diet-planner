const axios = require("axios");

const AI_URL = "http://127.0.0.1:8000/api/v1/alternatives/suggest";

const suggestAlternatives = async (req, res) => {
  try {
    const response = await axios.post(AI_URL, req.body);

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Alternatives error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alternatives",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  suggestAlternatives,
};