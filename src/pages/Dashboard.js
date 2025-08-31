import React from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import './styles/styles.css'
import Header from '../components/Header'

function Dashboard() {
  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
            <div className="header">
                <Header title="Bonjour" content="Bienvenue" date="31 Août" />
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
