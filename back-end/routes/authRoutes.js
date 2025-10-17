const express = require('express');
const router = express.Router();

// Dữ liệu đăng nhập mặc định
const DEFAULT_USERNAME = 'parent';
const DEFAULT_PASSWORD = '123456';

// Định nghĩa cấu trúc response (dạng Class Diagram)
/**
 * Class: User
 * - userId: string
 * - username: string
 * - role: string (Parent)
 */

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        // Giả lập token hoặc session data
        const userData = {
            userId: 'parent_001',
            username: username,
            role: 'Parent'
        };
        // Trả về thành công
        return res.json({
            success: true,
            message: 'Login successful',
            user: userData
        });
    } else {
        // Trả về lỗi
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

module.exports = router;