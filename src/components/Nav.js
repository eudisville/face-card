import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Correction: Import AuthContext au lieu d'AuthProvider
import './Nav.css';

function Nav() {
  const { session } = useContext(AuthContext); // Correction: Utilisation de AuthContext

  // Accéder aux données de l'utilisateur connecté
  const username = session?.user?.user_metadata?.display_name || 'Utilisateur';

  return (
    <nav>
      <div className="logo">
        <h5>FaceCard</h5>
        <p>Service Professionnel</p>
      </div>

      <div className="right">
        <div className="account">
          <h5>{username}</h5>
        </div>
      </div>
    </nav>
  );
}

export default Nav;