const driverService = require("../services/driverServices");
const path = require("path");
const fs = require("fs");

const getDriver = (req, res) => {
  driverService.getAllDriver((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const removeDriver = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa user ID:", id);

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  driverService.deleteDriver(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa user:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa",
        errorDetail: err.sqlMessage,
      });
    }

    // Kiểm tra có xóa được bản ghi nào không
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy tài khoản để xóa",
      });
    }

    console.log("✅ Xóa thành công, affected rows:", results.affectedRows);
    res.json({
      success: true,
      message: "Xóa thành công",
      data: results,
    });
  });
};

const createDriver = (req, res) => {
  console.log("� ===== CREATE DRIVER CALLED =====");
  console.log("�📥 Create Driver - Body:", req.body);
  console.log("📥 Create Driver - Files:", req.files);
  console.log("📥 Has files?", !!req.files);
  console.log("📥 Has anhTaiXe?", !!(req.files && req.files.anhTaiXe));

  const { tenTaiXe, ngaySinh, soDienThoai, soBangLai, trangThai } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!tenTaiXe || !soDienThoai || !soBangLai) {
    return res.status(400).json({
      success: false,
      error:
        "Thiếu thông tin bắt buộc (tên tài xế, số điện thoại, số bằng lái)",
    });
  }

  let anhTaiXePath = null;

  // Xử lý upload ảnh nếu có (sử dụng req.files như studentController)
  if (req.files && req.files.anhTaiXe) {
    const anhTaiXe = req.files.anhTaiXe;
    console.log("📸 Processing driver image:", anhTaiXe.name);

    // Tạo tên file unique
    const timestamp = Date.now();
    const fileExtension = anhTaiXe.name.split(".").pop();
    const fileName = `driver_${timestamp}.${fileExtension}`;

    // Đường dẫn lưu file (sử dụng đường dẫn tuyệt đối)
    const uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "drivers",
      fileName
    );
    console.log("📁 Upload path:", uploadPath);

    try {
      // Di chuyển file (ĐỒNG BỘ để đảm bảo hoàn thành trước khi tiếp tục)
      anhTaiXe.mv(uploadPath, (err) => {
        if (err) {
          console.error("❌ Lỗi khi lưu ảnh:", err);
          return res.status(500).json({
            success: false,
            error: "Không thể lưu ảnh",
          });
        }

        console.log("✅ Ảnh đã được lưu:", uploadPath);

        // CHỈ GỌI addDriver SAU KHI LƯU ẢNH THÀNH CÔNG
        const driver = {
          tenTaiXe,
          ngaySinh,
          anhTaiXe: `/images/drivers/${fileName}`,
          soDienThoai,
          soBangLai,
          trangThai: trangThai || "Active",
        };

        driverService.addDriver(driver, (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Lỗi server khi thêm tài xế",
              errorDetail: err,
            });
          }

          // ⛔ Nếu username tồn tại → trả exists cho frontend
          if (result.exists) {
            return res.json({ exists: true });
          }

          // ✅ Nếu thêm thành công
          res.json({
            success: true,
            message: "Thêm thành công",
            id: result.taiXe?.insertId,
          });
        });
      });
    } catch (error) {
      console.error("❌ Lỗi xử lý ảnh:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi xử lý ảnh",
      });
    }
  } else {
    // KHÔNG CÓ ẢNH - GỌI addDriver TRỰC TIẾP
    const driver = {
      tenTaiXe,
      ngaySinh,
      anhTaiXe: null,
      soDienThoai,
      soBangLai,
      trangThai: trangThai || "Active",
    };

    driverService.addDriver(driver, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Lỗi server khi thêm tài xế",
          errorDetail: err,
        });
      }

      // ⛔ Nếu username tồn tại → trả exists cho frontend
      if (result.exists) {
        return res.json({ exists: true });
      }

      // ✅ Nếu thêm thành công
      res.json({
        success: true,
        message: "Thêm thành công",
        id: result.taiXe?.insertId,
      });
    });
  }
};

const editDriver = (req, res) => {
  console.log("📥 Edit Driver - Body:", req.body);
  console.log("📥 Edit Driver - Files:", req.files);

  const id = req.params.id;
  const { tenTaiXe, ngaySinh, soDienThoai, soBangLai } = req.body;

  let anhTaiXePath = null;

  // Xử lý upload ảnh mới nếu có
  if (req.files && req.files.anhTaiXe) {
    const anhTaiXe = req.files.anhTaiXe;
    console.log("📸 Processing updated driver image:", anhTaiXe.name);

    // Tạo tên file unique
    const timestamp = Date.now();
    const fileExtension = anhTaiXe.name.split(".").pop();
    const fileName = `driver_${timestamp}.${fileExtension}`;

    // Đường dẫn lưu file
    const uploadPath = `public/images/drivers/${fileName}`;

    try {
      // Di chuyển file (ĐỒNG BỘ để đảm bảo hoàn thành trước khi tiếp tục)
      anhTaiXe.mv(uploadPath, (err) => {
        if (err) {
          console.error("❌ Lỗi khi lưu ảnh:", err);
          return res.status(500).json({
            success: false,
            error: "Không thể lưu ảnh",
          });
        }

        console.log("✅ Ảnh đã được cập nhật:", uploadPath);

        // CHỈ GỌI updateDriver SAU KHI LƯU ẢNH THÀNH CÔNG
        const driver = {
          tenTaiXe,
          ngaySinh,
          soDienThoai,
          soBangLai,
          anhTaiXe: `/images/drivers/${fileName}`,
        };

        driverService.updateDriver(id, driver, (err) => {
          if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
          res.json({ message: "Cập nhật thành công" });
        });
      });
    } catch (error) {
      console.error("❌ Lỗi xử lý ảnh:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi xử lý ảnh",
      });
    }
  } else {
    // KHÔNG CÓ ẢNH MỚI - GỌI updateDriver TRỰC TIẾP
    const driver = {
      tenTaiXe,
      ngaySinh,
      soDienThoai,
      soBangLai,
    };

    driverService.updateDriver(id, driver, (err) => {
      if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
      res.json({ message: "Cập nhật thành công" });
    });
  }
};

module.exports = {
  getDriver,
  removeDriver,
  createDriver,
  editDriver,
};
