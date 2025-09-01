import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import './Sidebar.css'

function Sidebar() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    }
  }

  return (
    <div className='sidebar'>
      <div className="sidebar-links">
        <Link to="/"><span><img src="maison.png" alt="" /></span>Tableau de Bord</Link>
        <Link to="/generator"><span><img src="reglages.png" alt="" /></span>Générateur</Link>
        <Link to="/history"><span><img src="calendrier-lignes.png" alt="" /></span>Historique</Link>
      </div>

      <div className="sidebar-logout">
          <Link to="/login" onClick={handleLogout}><span><img src="sortir.png" alt="" /></span>Déconnexion</Link>
      </div>
    </div>
  )
}

export default Sidebar