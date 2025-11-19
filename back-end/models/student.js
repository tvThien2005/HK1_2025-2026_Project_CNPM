// backend/models/Student.js
const db = require("../config/db"); // Điều chỉnh đường dẫn nếu cần

class Student {
  // Lấy tất cả học sinh
  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM students WHERE trangThai != "Deleted"';
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Lấy học sinh theo ID
  static async findByPk(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM students WHERE maHocSinh = ?";
      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]); // Trả về học sinh đầu tiên
      });
    });
  }

  // Tạo học sinh mới
  static async create(studentData) {
    return new Promise((resolve, reject) => {
      const { tenHocSinh, lop, anhHocSinh, trangThai = "Active" } = studentData;
      const query =
        "INSERT INTO students (tenHocSinh, lop, anhHocSinh, trangThai) VALUES (?, ?, ?, ?)";

      db.query(
        query,
        [tenHocSinh, lop, anhHocSinh, trangThai],
        (err, results) => {
          if (err) reject(err);
          else resolve({ maHocSinh: results.insertId, ...studentData });
        }
      );
    });
  }

  // Cập nhật học sinh
  static async update(id, studentData) {
    return new Promise((resolve, reject) => {
      const { tenHocSinh, lop, anhHocSinh, trangThai } = studentData;
      const query =
        "UPDATE students SET tenHocSinh = ?, lop = ?, anhHocSinh = ?, trangThai = ? WHERE maHocSinh = ?";

      db.query(
        query,
        [tenHocSinh, lop, anhHocSinh, trangThai, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ maHocSinh: id, ...studentData });
        }
      );
    });
  }

  // Xóa học sinh (soft delete)
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query =
        'UPDATE students SET trangThai = "Deleted" WHERE maHocSinh = ?';
      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = Student;
