import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Link } from 'react-router-dom';
import './styles/styles.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Inscription réussie ! Veuillez vérifier votre boîte e-mail pour confirmer votre compte.');
    }
  };

  return (
    <div className='auth-container'>
      <div className="auth-box">
        <div className="auth-header">
          <h2>FaceCard</h2>
          <p>App Générateur d'autocollants</p>
        </div>
        <form onSubmit={handleRegister}>
          <h5>Nom d'utilisateur</h5>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom d'utilisateur"
            required
            disabled={loading}
          />
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
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <Link to="/login">Déjà un compte ? Connectez-vous</Link>
      </div>
    </div>
  );
}

export default Register;