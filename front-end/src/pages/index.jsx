import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import StudentCard from '../components/StudentCard';
// import '../styles/Components.css';

function HomePage({ onLogout , onInfo}) {
  const [studentData, setStudentData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/data');
        setStudentData(response.data.student);
        setNotification(response.data.notification);
      } catch (err) {
        setError('Failed to fetch student data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!studentData) return <div>No student data available.</div>;

  return (
    <div className="app-layout">
      <Header onLogout={onLogout} notification={notification} onInfo = {onInfo}/>
      <main className="home-content">
        <div className="student-card-wrapper">
          {/* Thẻ đầy đủ (Giống ảnh trái) */}
          <StudentCard student={studentData} isSummaryDefault={false} />
          {/* Thẻ tóm tắt (Giống ảnh phải) */}
          <StudentCard student={studentData} isSummaryDefault={true} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;