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
  const [totalEleves, setTotalEleves] = useState(0);
  const [totalEcoles, setTotalEcoles] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Récupérer la session de l'utilisateur pour obtenir son ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur d'authentification:", userError?.message);
        setLoading(false);
        return;
      }

      // Récupérer les données de génération pour l'utilisateur
      const { data, error } = await supabase
        .from('generations')
        .select('nombre_eleves, nombre_ecoles')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', error.message);
      } else {
        // Calculer les totaux à partir des données récupérées
        const elevesTotal = data.reduce((sum, current) => sum + current.nombre_eleves, 0);
        const ecolesTotal = data.reduce((sum, current) => sum + current.nombre_ecoles, 0);

        setGenerationsCount(data.length);
        setTotalEleves(elevesTotal);
        setTotalEcoles(ecolesTotal);
      }
      setLoading(false);
    };

    fetchDashboardData();

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
              <Card 
                header="Nombres d'élèves" 
                count={loading ? '...' : totalEleves} 
                desc="Nombres de générations des élèves" 
              />
              <Card 
                header="Nombres d'écoles" 
                count={loading ? '...' : totalEcoles} 
                desc="Nombres de générations écoles" 
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
