import React from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import './styles/styles.css'
import Header from '../components/Header'
import Card from '../components/Card'
import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
            <div className="header">
              <Header title="Tableau de bord" content="Gérez vos templates et suivez toute l'activité" date="1 Septembre" />
            </div>

            <div className="cards">
              <Card header="Générations" count="28" desc="Nombres de générations FaceCard" />
            </div>

            <div className="actions">

              <div className="project">
                <div className="project-image">
                  <img src="editer.png" alt="" />
                </div>
                <div className="project-text">
                  <Link to="/generator"><h4>Créer un nouveau projet</h4></Link>
                  <p>Importez un fichier Excel et générez vos autocollants</p>
                </div>
              </div>

              <div className="project">
                <div className="project-image">
                  <img src="liste.png" alt="" />
                </div>
                <div className="project-text">
                  <Link to="/history"><h4>Historique</h4></Link>
                  <p>Consultez vos générations précédentes</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
