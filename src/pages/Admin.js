import React from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './styles/styles.css'

function Admin() {
  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
            <div className="header">
                <Header title="Admin" content="Gérez vos templates et suivez toute l'activité" date="" />
            </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
