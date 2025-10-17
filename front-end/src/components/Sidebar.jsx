import React from 'react'

export default function Sidebar({ active, setActive, onBack }) {

  // const handleBack = () =>{
  //   onBack();
  // }

  return (
    <aside className="sidebar">
      <button className="back-btn" title="Back" onClick={onBack}>←</button>

      <nav className="menu">
        <button
          className={`menu-item ${active === 'account' ? 'active' : ''}`}
          onClick={() => setActive('account')}
        >
          Thông tin tài khoản
        </button>

        <button
          className={`menu-item ${active === 'history' ? 'active' : ''}`}
          onClick={() => setActive('history')}
        >
          Lịch sử chuyến đi
        </button>
      </nav>
    </aside>
  )
}
