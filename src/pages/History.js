import React from 'react'
import Sidebar from '../components/Sidebar'
import Nav from '../components/Nav'
import Header from '../components/Header'
import './styles/styles.css'

function History() {
  return (
    <div>
        <Nav />
        <div className="content">
            <Sidebar />
            <div className="body">
              <div className="header">
                <Header title="Historique des générations" content="Consultez votre historique de générations ici." date="" />
              </div>
            </div>
        </div>
    </div>
  )
}

export default History
