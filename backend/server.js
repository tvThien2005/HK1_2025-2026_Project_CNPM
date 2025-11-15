const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const listStudentRoutes = require('./routes/listStudentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/driver', listStudentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});