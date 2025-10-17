const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = 5000;

app.use(cors()); // Cho phép frontend truy cập
app.use(express.json()); // Middleware để parse JSON body

// Tuyến đường API
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
    res.send('Smart School Bus Tracking System API Running');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});