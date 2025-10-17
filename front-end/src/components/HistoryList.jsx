import React from 'react'

const data = [
  { date: '24/12/2015', morning: 'Đúng giờ', afternoon: 'muộn 10 phút' },
  { date: '25/12/2015', morning: 'Đúng giờ', afternoon: 'tắc đường, trễ 12 phút' },
  { date: '26/12/2015', morning: 'Đúng giờ', afternoon: 'Đúng giờ' },
  { date: '27/12/2015', morning: 'Trễ 2 phút', afternoon: 'Đúng giờ' },
]

export default function HistoryList() {
  return (
    <div className="card history-card">
      <h2>Lịch sử đi học</h2>
      <p className="muted">Theo dõi tình hình đi học trong tuần qua</p>

      <div className="history-list">
        {data.map((item, i) => (
          <div className="history-item" key={i}>
            <div className="date">{item.date}</div>
            <div className="history-content">
              <div><strong>Sáng:</strong> {item.morning}</div>
              <div><strong>Chiều:</strong> {item.afternoon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
