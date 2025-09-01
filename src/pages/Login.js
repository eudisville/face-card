import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importez 'useNavigate'
import './styles/styles.css'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 2. Initialisez le hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // 3. Redirigez l'utilisateur vers la page d'accueil
      navigate('/', { replace: true });
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
            disabled={loading}
          />
          <h5>Mot de passe</h5>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            disabled={loading}
          />
          {error && <p className="error-message">{error}</p>}
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