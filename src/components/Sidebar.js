import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import './Sidebar.css';

function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();

        if (profile && profile.roles === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    checkAdminRole();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className='sidebar'>
      <div className="sidebar-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}><span><img src="maison.png" alt="" /></span>Tableau de Bord</Link>
        <Link to="/generator" className={isActive('/generator') ? 'active' : ''}><span><img src="reglages.png" alt="" /></span>Générateur</Link>
        <Link to="/history" className={isActive('/history') ? 'active' : ''}><span><img src="calendrier-lignes.png" alt="" /></span>Historique</Link>
        {isAdmin && (
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}><span><img src="admin.png" alt="" /></span>Administration</Link>
        )}
      </div>

      <div className="sidebar-logout">
        <Link to="/login" onClick={handleLogout}><span><img src="sortir.png" alt="" /></span>Déconnexion</Link>
      </div>
    </div>
  );
}

export default Sidebar;