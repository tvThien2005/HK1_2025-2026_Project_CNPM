const express = require('express');
const router = express.Router();

// Định nghĩa cấu trúc dữ liệu theo Class Diagram và yêu cầu
// Tương ứng với các Class: Student, BusTrip, Notification
const studentData = {
    // Class: Student
    studentId: 'st_001',
    studentName: 'Nguyễn Văn A',
    studentClass: 'Lớp 10A02',
    
    // Class: BusTrip (Lượt đi)
    morningTrip: {
        tripId: 'T_001',
        tripType: 'Chuyến đón',
        busNumber: 'BUS-1267', // Class: Bus
        driverName: 'Lê Văn B', // Class: Driver
        scheduledTime: '7:00 AM',
        pickupPoint: 'Ngã Tư Ga', // Class: PickupPoint
        status: 'Đang trên xe',
        progress: 90,
        currentAction: 'Đang di chuyển đến trường',
        estimatedArrivalTime: '7:10 AM',
        pickupStatus: 'Đã đón'
    },
    
    // Class: BusTrip (Lượt về)
    afternoonTrip: {
        tripId: 'T_002',
        tripType: 'Chuyến trả',
        busNumber: 'BUS-1268', // Class: Bus
        driverName: 'Nguyễn Văn B', // Class: Driver
        scheduledTime: '4:30 PM',
        pickupPoint: 'Ngã Tư Ga', // Class: PickupPoint
        status: 'Chưa diễn ra',
        pickupStatus: 'Chưa diễn ra'
    }
};

const notifications = [
    // Dạng 1: Đón thành công
    {
        type: 'success',
        message: 'Xe buýt đã đón Nguyễn Văn A lúc 6:45 AM tại điểm dừng Ngã tư Nguyễn Huệ',
        timeAgo: '5 phút trước'
    },
    // Dạng 2: Đến trường đúng giờ
    {
        type: 'success',
        message: 'Nguyễn Văn A đã đến trường đúng giờ lúc 6:45 AM',
        timeAgo: '3 phút trước'
    },
    // Dạng 3: Thay đổi lịch trình (trễ)
    {
        type: 'warning',
        message: 'Thông báo lịch trình có thay đổi. Xe sẽ đến muộn do tắc đường.',
        timeAgo: '6 phút trước'
    }
];

// Hàm chọn ngẫu nhiên 1 thông báo
const getRandomNotification = () => {
    const randomIndex = Math.floor(Math.random() * notifications.length);
    return notifications[randomIndex];
};


router.get('/data', (req, res) => {
    // Giả lập logic chuyển trạng thái sau khi đến trường
    const currentStudentData = { ...studentData };
    let currentNotification = getRandomNotification();

    // Nếu đã đến trường
    if (Math.random() > 0.5) { // 50% giả lập đã đến trường
        currentStudentData.morningTrip.status = 'Đã đến trường';
        currentStudentData.morningTrip.progress = 100;
        currentStudentData.morningTrip.currentAction = 'Đã đến trường';
        currentStudentData.morningTrip.arrivalTime = '7:00 AM'; // Thêm thời gian đến thực tế
        
        // Cập nhật thông báo nếu giả lập đến trường
        currentNotification = notifications[1]; // Dùng thông báo đến trường
    }
    
    res.json({
        student: currentStudentData,
        notification: currentNotification
    });
});

module.exports = router;