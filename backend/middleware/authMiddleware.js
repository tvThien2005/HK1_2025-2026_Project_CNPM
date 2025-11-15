const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, 'MY_SUPER_SECRET_KEY_123'); 

            req.user = decoded; 
            return next(); 
        } catch (error) {
            res.status(401).json({ message: 'Token không hợp lệ, không có quyền truy cập.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không tìm thấy token, không có quyền truy cập.' });
    }
};

const isDriver = (req, res, next) => {
    if (req.user && req.user.capDo === 'Driver') {
        return next();
    } else {
        res.status(403).json({ message: 'Yêu cầu quyền Tài xế.' });
    }
};

module.exports = { protect, isDriver };