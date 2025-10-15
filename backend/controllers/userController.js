const userService = require("../services/userService");

const getUsers = (req, res) => {
  userService.getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const removeUser = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa user ID:", id);

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  userService.deleteUser(id, (err, results) => {
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

const createUser = (req, res) => {
  const user = req.body;
  userService.addUser(user, (err, result) => {
    if (err) {
      console.error("🚨 Lỗi trong API:", err);

      // TRẢ VỀ LỖI CHI TIẾT CHO FRONTEND
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm tài khoản",
        errorDetail: {
          code: err.code,
          sqlMessage: err.sqlMessage,
          fullError: err.toString(),
        },
      });
    }
    res.json({ message: "Thêm thành công", id: result.insertId });
  });
};

const editUser = (req, res) => {
  const id = req.params.id;
  const user = req.body;
  userService.updateUser(id, user, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
    res.json({ message: "Cập nhật thành công" });
  });
};

const blockUser = (req, res) => {
  const id = req.params.id;
  userService.blockUser(id, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi khóa" });
    res.json({ message: "Tài khoản đã bị khóa" });
  });
};
const unblockUser = (req, res) => {
  const id = req.params.id;
  userService.unblockUser(id, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi mở khóa" });
    res.json({ message: "Tài khoản đã được mở khóa" });
  });
};
// Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
      });
    }

    const user = await userService.loginUser(username, password);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      user: user,
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error.message);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  removeUser,
  createUser,
  editUser,
  blockUser,
  unblockUser,
  login,
};
