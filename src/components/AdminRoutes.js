import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function checkAdminStatus() {
      // Vérifie si un utilisateur est authentifié
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false); // Pas d'utilisateur, donc pas admin
        return;
      }

      // Récupère le profil de l'utilisateur pour vérifier son rôle
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      if (error || !profile || profile.roles !== 'admin') {
        setIsAdmin(false); // L'utilisateur n'est pas admin
      } else {
        setIsAdmin(true); // L'utilisateur est admin
      }
    }

    checkAdminStatus();
  }, []);

  // Affiche un message de chargement tant que le statut n'est pas vérifié
  if (isAdmin === null) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur est admin, affiche la page demandée
  if (isAdmin) {
    return children;
  }

  // Si l'utilisateur n'est pas admin, le redirige vers la page d'accueil
  return <Navigate to="/" replace />;
}

export default AdminRoute;