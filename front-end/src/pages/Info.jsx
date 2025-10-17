import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import AccountInfo from '../components/AccountInfo'
import HistoryList from '../components/HistoryList'

function Info({onBack}) {
  const [active, setActive] = useState('account') // 'account' | 'history'

  return (
    <div className="app-root">
      <Header />
      <div className="container">
        <Sidebar active={active} setActive={setActive} onBack={onBack}/>
        <main className="main-content">
          {active === 'account' ? <AccountInfo /> : <HistoryList />}
        </main>
      </div>
    </div>
  )
}

export default Info;
