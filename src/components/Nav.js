import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { Link } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const { session } = useContext(AuthContext);
  const [profileName, setProfileName] = useState('Utilisateur');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      setLoading(true); // Démarrez le chargement
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setProfileName('Utilisateur');
        } else if (data) {
          setProfileName(data.name || 'Utilisateur');
        }
      } else {
        setProfileName('Utilisateur');
      }
      setLoading(false); // Arrêtez le chargement
    }
    getProfile();
  }, [session]);

  return (
    <nav>
    <div className="logo">
      <div className="img">
        <img src="cas.png" alt="" />
      </div>
      <div className="text">
        <h5>FaceCard</h5>
        <p>Solution Professionnelle</p>
      </div>
    </div>
    <div className="right">
      {session ? (
        <div className="account">
          <div className="account-img">
            <img src="utilisateur.png" alt="" />
          </div>
          {loading ? (
            <div className="spinner-container">
              <div className="spinner-nav"></div>
            </div>
          ) : (
            <h5>{profileName}</h5>
          )}
        </div>
      ) : (
        <Link to="/login">Se connecter</Link>
      )}
    </div>
  </nav>
  );
}

export default Nav;