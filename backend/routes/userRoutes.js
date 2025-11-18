const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// --- Thêm route Đăng nhập ---
router.post("/login", userController.login);

router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.editUser);
router.delete("/:id", userController.removeUser);
router.patch("/:id/block", userController.blockUser);
router.patch("/:id/unblock", userController.unblockUser);

module.exports = router;
