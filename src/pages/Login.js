import React, { useState } from 'react';
import './styles/styles.css';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Ajout de l'état de chargement
  const [error, setError] = useState(null); // Ajout de l'état d'erreur
  const navigate = useNavigate(); // Utilisation du hook useNavigate pour la redirection

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Activer l'état de chargement
    setError(null); // Réinitialiser l'erreur

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false); // Désactiver l'état de chargement

    if (error) {
      setError(error.message); // Mettre à jour l'état d'erreur pour l'afficher dans l'UI
    } else {
      // Redirection vers le tableau de bord
      navigate('/'); 
    }
  };

  return (
    <div className='auth-container'>
      <div className="auth-box">
        <div className="auth-header">
          <h2>FaceCard</h2>
          <p>App Générateur d'autocollants</p>
        </div>

        <form onSubmit={handleLogin}>
          <h5>Adresse Email</h5>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading} // Désactiver l'input pendant le chargement
          />
          <h5>Mot de passe</h5>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            disabled={loading} // Désactiver l'input pendant le chargement
          />
          {error && <p className="error-message">{error}</p>} {/* Affichage du message d'erreur */}
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <Link to="/register">Pas de compte ? Inscrivez-vous</Link>
      </div>
    </div>
  );
}

export default Login;