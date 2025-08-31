import React from 'react'
import Sidebar from '../components/Sidebar'
import Nav from '../components/Nav'
import './styles/styles.css'

function History() {
  return (
    <div>
        <Nav />
        <div className="content">
            <Sidebar />
        </div>
    </div>
  )
}

export default History
