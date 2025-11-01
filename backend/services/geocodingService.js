// services/geocodingService.js
const axios = require("axios");

const getCoordinatesFromAddress = async (address) => {
  try {
    console.log("🌐 Geocoding address:", address);

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
          countrycodes: "vn", // Chỉ tìm trong Vietnam
          "accept-language": "vi", // Ngôn ngữ tiếng Việt
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    console.log("📍 Geocoding response:", response.data);

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        longitude: parseFloat(result.lon),
        latitude: parseFloat(result.lat),
        displayName: result.display_name,
      };
    }

    console.log("❌ Không tìm thấy tọa độ cho địa chỉ:", address);
    // Trả về tọa độ mặc định (Hồ Chí Minh)
    return {
      longitude: 106.629664,
      latitude: 10.823099,
      displayName: "Default Location - Hồ Chí Minh",
    };
  } catch (error) {
    console.error("❌ Lỗi geocoding:", error.message);
    return {
      longitude: 106.629664,
      latitude: 10.823099,
      displayName: "Error Location - Hồ Chí Minh",
    };
  }
};

module.exports = { getCoordinatesFromAddress };
