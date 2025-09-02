import React, { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import './styles/styles.css'
import Header from '../components/Header'
import Card from '../components/Card'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

function Dashboard() {
  const [generationsCount, setGenerationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchGenerationsCount = async () => {
      const { data, count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Error fetching generations count:', error.message);
      } else {
        setGenerationsCount(count);
      }
      setLoading(false);
    };

    fetchGenerationsCount();
  }, []);

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
              <Card 
                header="Générations" 
                count={loading ? '...' : generationsCount} 
                desc="Nombres de générations FaceCard" 
              />
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
