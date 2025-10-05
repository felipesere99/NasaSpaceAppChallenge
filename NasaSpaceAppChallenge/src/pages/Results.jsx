import React from 'react'
import './Results.css'

export default function Results({ onBack, coords, dates }) {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>← Back</button>
      <h2>Results</h2>
      <p>Coordinates: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'none'}</p>
      <p>From: {dates.from || '—'} To: {dates.to || '—'}</p>
      <p>This page will show calculation results (placeholder).</p>
    </div>
  )
}
