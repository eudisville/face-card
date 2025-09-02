import React from 'react'
import './Header.css'

function Header({ title, content, date }) {
  return (
    <header>
        <div className="header-text">
            <div className="header-left">
                <h1>{title}</h1>
                <p>{content}</p>
            </div>

            <div className="header-right">
                <h5>Aujourd'hui</h5>
                <h2>{date}</h2>
            </div>
        </div>
    </header>
  )
}

export default Header