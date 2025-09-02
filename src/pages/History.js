import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../supabase/supabaseClient';
import './styles/styles.css';
import './styles/history.css'

function Historique() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUserId(session.user.id);
          fetchGenerations(session.user.id);
        } else {
          setUserId(null);
          setGenerations([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // C'est le useEffect qui doit être modifié
  useEffect(() => {
    if (userId) {
      fetchGenerations(userId, startDate, endDate);
    }
  }, [userId, startDate, endDate]); // Ajout de startDate et endDate comme dépendances

  const fetchGenerations = async (id, start, end) => {
    setLoading(true);
    let query = supabase
      .from('generations')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Ajout des conditions de filtre
    if (start) {
      query = query.gte('created_at', start);
    }
    if (end) {
      // Pour inclure la journée entière, nous ajoutons le temps de fin de journée
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur de récupération de l'historique:", error);
      setError("Impossible de charger l'historique.");
    } else {
      setGenerations(data);
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés de 0, donc +1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };
  
  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
          <div className="header">
            <Header title="Historique des générations" content="Consultez et téléchargez vos anciens fichiers PDF." />
          </div>
          <div className="historique-container">
            <h1>Historique des générations</h1>

            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="startDate">Date de début</label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-date"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="endDate">Date de fin</label>
                <input 
                  type="date" 
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-date"
                />
              </div>
            </div>
            {loading ? (
              <p>Chargement de l'historique...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : generations.length === 0 ? (
              <div className="empty-history-message">
                <h3>Aucune génération trouvée.</h3>
                <p>Pour l'instant, votre historique est vide. <br /> Dirigez-vous vers le <a href="/generator">générateur</a> pour créer vos premiers autocollants !</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="generations-table">
                  <thead>
                    <tr>
                      <th scope="col" className="table-header">Date</th>
                      <th scope="col" className="table-header">Nom du fichier</th>
                      <th scope="col" className="table-header">Élèves</th>
                      <th scope="col" className="table-header">Écoles</th>
                      <th scope="col" className="table-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generations.map((gen) => (
                      <tr key={gen.id}>
                        <td className="table-data">{formatTimestamp(gen.created_at)}</td>
                        <td className="table-data file-name">{gen.file_name}</td>
                        <td className="table-data">{gen.nombre_eleves}</td>
                        <td className="table-data">{gen.nombre_ecoles}</td>
                        <td className="table-data">
                          <a href={gen.file_url} target="_blank" rel="noopener noreferrer" className="download-button">
                            Télécharger
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Historique;
