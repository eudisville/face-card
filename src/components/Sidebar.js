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
        <Link to="/">Tableau de Bord</Link>
        <Link to="/generator">Générateur</Link>
        <Link to="/history">Historique</Link>
      </div>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>
          <Link to="/login">Déconnexion</Link>
        </button>
      </div>
    </div>
  )
}

export default Sidebar