const studentService = require("../services/studentService");
const path = require("path");
const fs = require("fs");

// controllers/studentController.js - CẬP NHẬT getStudents
const getStudents = (req, res) => {
  studentService.getAllStudents((err, students) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });

    // Format dữ liệu để trả về frontend
    const formattedStudents = students.map((student) => ({
      maHocSinh: student.maHocSinh,
      tenHocSinh: student.tenHocSinh,
      anhHocSinh: student.anhHocSinh,
      lop: student.lop,
      trangThai: student.trangThai,
      diaChi: {
        soNha: student.soNha,
        duong: student.duong,
        phuongXa: student.phuongXa,
        quanHuyen: student.quanHuyen,
        thanhPho: student.thanhPho,
      },
      // Thêm tọa độ nếu cần
      toaDo:
        student.kinhDo && student.viDo
          ? {
              kinhDo: student.kinhDo,
              viDo: student.viDo,
            }
          : null,
    }));

    console.log(
      `✅ Trả về ${formattedStudents.length} học sinh với địa chỉ đầy đủ`
    );
    res.json(formattedStudents);
  });
};

const removeStudent = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa user ID:", id);

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  studentService.deleteStudent(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa student:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa",
        errorDetail: err.sqlMessage,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy học sinh để xóa",
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

// SỬA LẠI createStudent - Thêm xử lý địa chỉ
const createStudent = (req, res) => {
  console.log("📥 Create Student - Body:", req.body);
  console.log("📥 Create Student - Files:", req.files);

  const { tenHocSinh, lop, soNha, duong, phuongXa, quanHuyen, thanhPho } =
    req.body;

  // Kiểm tra thông tin bắt buộc
  if (!tenHocSinh || !lop) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin bắt buộc (tên học sinh, lớp)",
    });
  }

  let anhHocSinhPath = null;

  // Xử lý upload ảnh nếu có (sử dụng req.files thay vì req.file)
  if (req.files && req.files.anhHocSinh) {
    const anhHocSinh = req.files.anhHocSinh;

    // Tạo thư mục nếu chưa tồn tại
    const uploadDir = path.join(__dirname, "../public/images/students");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo tên file mới
    const fileExtension = path.extname(anhHocSinh.name);
    const fileName = `student_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Lưu file
    anhHocSinh.mv(filePath, (mvErr) => {
      if (mvErr) {
        console.error("❌ Lỗi khi lưu file:", mvErr);
        return res.status(500).json({
          success: false,
          error: "Lỗi khi upload ảnh",
        });
      }

      anhHocSinhPath = `/images/students/${fileName}`;
      saveStudentToDatabase();
    });
  } else {
    // Không có ảnh, lưu luôn
    saveStudentToDatabase();
  }

  function saveStudentToDatabase() {
    const newStudent = {
      tenHocSinh,
      lop,
      anhHocSinh: anhHocSinhPath,
      soNha: soNha || "",
      duong: duong || "",
      phuongXa: phuongXa || "",
      quanHuyen: quanHuyen || "",
      thanhPho: thanhPho || "",
      trangThai: "Active",
    };

    console.log("📤 Dữ liệu gửi đến service:", newStudent);

    studentService.addStudent(newStudent, (err, result) => {
      if (err) {
        console.error("🚨 Lỗi trong API:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi server khi thêm học sinh",
          errorDetail: {
            code: err.code,
            sqlMessage: err.sqlMessage,
            fullError: err.toString(),
          },
        });
      }
      res.json({
        success: true,
        message: "Thêm thành công",
        id: result.insertId,
      });
    });
  }
};

// SỬA LẠI editStudent - Thêm xử lý địa chỉ
const editStudent = (req, res) => {
  const id = req.params.id;

  console.log("=== DEBUG EDIT STUDENT ===");
  console.log("📥 Student ID:", id);
  console.log("📥 Request body:", req.body);
  console.log("📥 Request files:", req.files);
  console.log("========================");

  // Lấy thông tin từ form - THÊM CÁC TRƯỜNG ĐỊA CHỈ
  const {
    tenHocSinh,
    lop,
    trangThai,
    soNha,
    duong,
    phuongXa,
    quanHuyen,
    thanhPho,
  } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!tenHocSinh || !lop) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin bắt buộc (tenHocSinh, lop)",
    });
  }

  // Đầu tiên, lấy thông tin học sinh hiện tại để biết ảnh cũ
  studentService.getStudentById(id, (err, currentStudent) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Lỗi khi lấy thông tin học sinh",
      });
    }

    if (!currentStudent) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy học sinh",
      });
    }

    let anhHocSinhPath = currentStudent.anhHocSinh;

    // Xử lý upload ảnh mới nếu có
    if (req.files && req.files.anhHocSinh) {
      const anhHocSinh = req.files.anhHocSinh;

      // Tạo thư mục nếu chưa tồn tại
      const uploadDir = path.join(__dirname, "../public/images/students");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Xóa ảnh cũ nếu có
      if (currentStudent.anhHocSinh) {
        const oldImagePath = path.join(
          __dirname,
          "../public",
          currentStudent.anhHocSinh
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Tạo tên file mới
      const fileExtension = path.extname(anhHocSinh.name);
      const fileName = `student_${id}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Lưu file mới
      anhHocSinh.mv(filePath, (mvErr) => {
        if (mvErr) {
          console.error("❌ Lỗi khi lưu file:", mvErr);
          return res.status(500).json({
            success: false,
            error: "Lỗi khi upload ảnh",
          });
        }

        anhHocSinhPath = `/images/students/${fileName}`;

        // Cập nhật thông tin học sinh với ảnh mới
        updateStudentInfo();
      });
    } else {
      // Không có ảnh mới, cập nhật thông tin ngay
      updateStudentInfo();
    }

    function updateStudentInfo() {
      const updatedStudent = {
        tenHocSinh,
        lop,
        anhHocSinh: anhHocSinhPath,
        trangThai: trangThai || currentStudent.trangThai,
        soNha: soNha || "",
        duong: duong || "",
        phuongXa: phuongXa || "",
        quanHuyen: quanHuyen || "",
        thanhPho: thanhPho || "",
      };

      console.log("📤 Dữ liệu cập nhật gửi đến service:", updatedStudent);

      studentService.updateStudent(id, updatedStudent, (updateErr, results) => {
        if (updateErr) {
          console.error("❌ Lỗi khi cập nhật học sinh:", updateErr);
          return res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật học sinh",
            errorDetail: updateErr.sqlMessage,
          });
        }

        res.json({
          success: true,
          message: "Cập nhật học sinh thành công",
          data: results,
        });
      });
    }
  });
};

const blockStudent = (req, res) => {
  const id = req.params.id;
  studentService.blockStudent(id, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi khóa" });
    res.json({ message: "Học sinh đã bị khóa" });
  });
};

const unblockStudent = (req, res) => {
  const id = req.params.id;
  studentService.unblockStudent(id, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi mở khóa" });
    res.json({ message: "Học sinh đã được mở khóa" });
  });
};

const getStudentById = (req, res) => {
  const id = req.params.id;

  studentService.getStudentById(id, (err, student) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi lấy thông tin học sinh",
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy học sinh",
      });
    }

    // Format dữ liệu để trả về frontend
    const formattedStudent = {
      maHocSinh: student.maHocSinh,
      tenHocSinh: student.tenHocSinh,
      anhHocSinh: student.anhHocSinh,
      lop: student.lop,
      trangThai: student.trangThai,
      diaChi: {
        soNha: student.soNha,
        duong: student.duong,
        phuongXa: student.phuongXa,
        quanHuyen: student.quanHuyen,
        thanhPho: student.thanhPho,
      },
    };

    res.json({
      success: true,
      data: formattedStudent,
    });
  });
};

module.exports = {
  getStudents,
  getStudentById,
  removeStudent,
  createStudent,
  editStudent,
  blockStudent,
  unblockStudent,
};
