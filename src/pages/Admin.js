import React, { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './styles/styles.css'
import AdminCard from '../components/AdminCard'
import './styles/admin.css'
import { supabase } from '../supabase/supabaseClient'

function Admin() {

    const [totalGenerations, setTotalGenerations] = useState(0);
    const [totalEleves, setTotalEleves] = useState(0);
    const [totalEcoles, setTotalEcoles] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const fetchAdminData = async () => {
    // Requête pour le nombre total de générations
    const { count: generationsCount, error: genError } = await supabase
      .from('generations')
      .select('*', { count: 'exact' });

    // Requête pour la somme totale des élèves
    const { data: elevesData, error: elevesError } = await supabase
      .from('generations')
      .select('nombre_eleves');
      
    // Requête pour la somme totale des écoles
    const { data: ecolesData, error: ecolesError } = await supabase
      .from('generations')
      .select('nombre_ecoles');

    // Requête pour le nombre total d'utilisateurs
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (genError || elevesError || ecolesError || usersError) {
      console.error('Erreur lors de la récupération des données admin:', genError || elevesError || ecolesError || usersError);
    } else {
      const elevesTotal = elevesData.reduce((sum, item) => sum + item.nombre_eleves, 0);
      const ecolesTotal = ecolesData.reduce((sum, item) => sum + item.nombre_ecoles, 0);

      setTotalGenerations(generationsCount);
      setTotalEleves(elevesTotal);
      setTotalEcoles(ecolesTotal);
      setTotalUsers(usersCount); // <-- Ligne ajoutée
    }
    setLoading(false);
};

        fetchAdminData();
        }, []);
        
    return (
        <div>
        <Nav />
        <div className="content">
            <Sidebar />
            <div className="body">
                <div className="header">
                    <Header title="Admin" content="Gérez vos templates et suivez toute l'activité" date="" />
                </div>

        {loading ? (
        <p>Chargement des données...</p>
        ) : (
        <div className="admin-cards">
            <AdminCard 
                header="Utilisateurs" 
                count={totalUsers} 
                desc="Nombre d'utilisateurs actifs sur la plateforme" 
            />
            <AdminCard header="Générations Totales" count={totalGenerations} desc="Nombre global des générations" />
            <AdminCard header="Générations totales élèves" count={totalEleves} desc="Nombre d'élèves générés" />
        </div>
        )}
            </div>
        </div>
        </div>
    )
    }

    export default Admin
