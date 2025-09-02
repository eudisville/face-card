import React from 'react'
import './Card.css'

function Card({ header, count, desc }) {
  return (
    <div className='card'>
      <div className="card-items">
        <h5>{header}</h5>
        <h2>{count}</h2>
        <p>{desc}</p>
      </div>
    </div>
  )
}

export default Card
