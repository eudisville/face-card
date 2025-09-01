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
              <Header title="Tableau de bord" content="Bienvenue sur FaceCard" date="1 Septembre" />
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
