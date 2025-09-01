import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { Link } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const { session } = useContext(AuthContext);
  const [profileName, setProfileName] = useState('Chargement...');

  useEffect(() => {
    async function getProfile() {
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
    }
    getProfile();
  }, [session]);

  return (
    <nav>
      <div className="logo">
        <h5>FaceCard</h5>
        <p>Service Professionnel</p>
      </div>
      <div className="right">
        {session ? (
          <div className="account">
            <h5>{profileName}</h5>
          </div>
        ) : (
          <Link to="/login">Se connecter</Link>
        )}
      </div>
    </nav>
  );
}

export default Nav;