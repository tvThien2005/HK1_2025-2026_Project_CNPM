// test-api.js
const axios = require("axios");

async function testAssignStation() {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/students/assign-station",
      {
        maHocSinh: 1,
        maDiemDung: 1,
        loaiPhanBo: "Sang",
      }
    );
    console.log("✅ API Response:", response.data);
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
  }
}

testAssignStation();
