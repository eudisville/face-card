import React, { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './styles/styles.css';
import AdminCard from '../components/AdminCard';
import './styles/admin.css';
import { supabase } from '../supabase/supabaseClient';

function Admin() {
    const [totalGenerations, setTotalGenerations] = useState(0);
    const [totalEleves, setTotalEleves] = useState(0);
    const [totalEcoles, setTotalEcoles] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [users, setUsers] = useState([]); // Ajout de l'état pour la liste des utilisateurs

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

            // Requête pour le nombre total d'utilisateurs et la liste des utilisateurs
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, name, roles'); // Récupération de l'ID, du nom et des rôles

            if (genError || elevesError || ecolesError || usersError) {
                console.error('Erreur lors de la récupération des données admin:', genError || elevesError || ecolesError || usersError);
            } else {
                const elevesTotal = elevesData.reduce((sum, item) => sum + item.nombre_eleves, 0);
                const ecolesTotal = ecolesData.reduce((sum, item) => sum + item.nombre_ecoles, 0);

                setTotalGenerations(generationsCount);
                setTotalEleves(elevesTotal);
                setTotalEcoles(ecolesTotal);
                setTotalUsers(usersData.length);
                setUsers(usersData); // Mise à jour de l'état des utilisateurs
            }
            setLoading(false);
        };

        fetchAdminData();
    }, []);

    // Fonction pour promouvoir un utilisateur en admin
    const handlePromoteUser = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ roles: 'admin' }) // Mettre à jour la colonne 'roles'
            .eq('id', userId);

        if (error) {
            console.error('Erreur lors de la promotion de l\'utilisateur:', error.message);
            alert('Erreur lors de la promotion de l\'utilisateur.');
        } else {
            // Met à jour l'état local pour refléter le changement
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === userId ? { ...user, roles: 'admin' } : user
            ));
            alert('Utilisateur promu avec succès !');
        }
    };

    const handleDemoteUser = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ roles: 'agent' }) // Met à jour la colonne 'roles' avec la valeur 'agent'
        .eq('id', userId);

    if (error) {
        console.error('Erreur lors de la rétrogradation de l\'utilisateur:', error.message);
        alert('Erreur lors de la rétrogradation de l\'utilisateur.');
    } else {
        // Met à jour l'état local pour refléter le changement
        setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? { ...user, roles: 'agent' } : user
        ));
        alert('Utilisateur rétrogradé avec succès !');
    }
  };

        
    return (
        <div>
            <div className="nav">
                <Nav />
            </div>
            <div className="content">
                <div className="bar">
                    <Sidebar />
                </div>
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
                    
                    {/* Section d'affichage des utilisateurs sous forme de tableau */}
                    <div className="users-list-container">
                      <h2>Liste des utilisateurs</h2>
                      {loading ? (
                          <p>Chargement des utilisateurs...</p>
                      ) : (
                          <table className="users-table">
                              <thead>
                                  <tr>
                                      <th>Nom</th>
                                      <th>Rôle</th>
                                      <th>Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {users.map((user) => (
                                      <tr key={user.id}>
                                          <td>{user.name}</td>
                                          <td>{user.roles === 'admin' ? 'Admin' : 'Utilisateur'}</td>
                                          <td>
                                              {user.roles === 'admin' ? (
                                                  // Affiche le bouton "Rétrograder" si le rôle est "admin"
                                                  <button onClick={() => handleDemoteUser(user.id)}>
                                                      Rétrograder
                                                  </button>
                                              ) : (
                                                  // Affiche le bouton "Promouvoir" si le rôle est "agent"
                                                  <button onClick={() => handlePromoteUser(user.id)}>
                                                      Promouvoir
                                                  </button>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
                </div>
            </div>
        </div>
    )
}

export default Admin