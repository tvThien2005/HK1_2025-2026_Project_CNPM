const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { tenDangNhap, matKhau } = req.body;

    if (!tenDangNhap || !matKhau) {
        return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const query = 'SELECT * FROM taiKhoan WHERE tenDangNhap = ?';
    db.query(query, [tenDangNhap], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        const user = results[0];

        if (matKhau !== user.matKhau) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        if (user.capDo !== 'Driver') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
        }
        
        if (user.block === 1) {
            return res.status(403).json({ message: 'Tài khoản không có quyền truy cập.' });
        }

        const driverQuery = 'SELECT maTaiXe FROM taiXe WHERE maTaiKhoan = ?';
        db.query(driverQuery, [user.maTaiKhoan], (err, driverResults) => {
            if (err || driverResults.length === 0) {
                return res.status(500).json({ message: 'Không tìm thấy thông tin tài xế.' });
            }

            const payload = {
                maTaiKhoan: user.maTaiKhoan,
                maTaiXe: driverResults[0].maTaiXe,
                capDo: user.capDo
            };

            const token = jwt.sign(payload, 'MY_SUPER_SECRET_KEY_123', { expiresIn: '5h' });

            res.status(200).json({
                message: 'Đăng nhập thành công!',
                token: token
            });
        });
    });
};

module.exports = { login };