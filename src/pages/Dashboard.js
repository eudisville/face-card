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
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const fetchGenerationsCount = async () => {
      // Récupérer la session de l'utilisateur pour obtenir son ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur d'authentification:", userError?.message);
        setLoading(false);
        return;
      }

      // Récupérer le nombre de générations pour l'utilisateur
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id); // Filtrer par l'ID de l'utilisateur
      
      if (error) {
        console.error('Error fetching generations count:', error.message);
      } else {
        setGenerationsCount(count);
      }
      setLoading(false);
    };

    fetchGenerationsCount();
  }, []);

  useEffect(() => {
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('fr-FR', options);
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
            <div className="header">
              <Header title="Tableau de bord" content="Gérez vos templates et suivez toute l'activité" date={currentDate} />
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
