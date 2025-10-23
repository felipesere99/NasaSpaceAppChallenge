import React, { useEffect, useState } from 'react'
import FavoriteItem from '../components/FavoriteItem'
import '../styles/profile.css'

export default function Profile() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFavorite, setNewFavorite] = useState({ name: '', place: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    fetch('/api/favorites')
      .then(r => r.json())
      .then(data => setFavorites(data || []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdate = (updated) => {
    // si backend devolvió eliminado, filtrar; si no, reemplazar
    if (updated._deleted) {
      setFavorites(prev => prev.filter(f => f.id !== updated.id))
    } else {
      setFavorites(prev => prev.map(f => (f.id === updated.id ? updated : f)))
    }
  }

  const handleAddToggle = () => {
    setShowAddForm(prev => !prev)
    setNewFavorite({ name: '', place: '' })
    setCreateError('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newFavorite.name.trim() || !newFavorite.place.trim()) {
      setCreateError('Completá el nombre y el lugar.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFavorite.name.trim(),
          place: newFavorite.place.trim()
        })
      })
      if (!res.ok) throw new Error('Error al crear favorito')
      const created = await res.json()
      setFavorites(prev => [created, ...prev])
      handleAddToggle()
    } catch (e) {
      console.error(e)
      setCreateError('No se pudo crear el favorito. Probá nuevamente.')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-glow" aria-hidden />
        <div className="profile-hero-grid">
          <div className="profile-title">
            <span className="profile-kicker">Tu espacio</span>
            <h1>Perfil</h1>
            <p className="profile-sub">
              Administrá y mantené actualizados tus lugares favoritos para volver a visitarlos cuando quieras.
            </p>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={handleAddToggle}>
              {showAddForm ? 'Cerrar formulario' : 'Agregar lugar'}
            </button>
            <button className="btn btn-ghost" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </section>

      <main className="profile-main">
        <header className="profile-section-header">
          <div>
            <h2>Tus favoritos</h2>
            <p className="profile-section-sub">
              {favorites.length > 0 ? `${favorites.length} lugares guardados` : 'Creá tu primera lista de lugares imperdibles.'}
            </p>
          </div>
        </header>

        {showAddForm && (
          <form className="profile-add-card" onSubmit={handleCreate}>
            <div className="profile-add-fields">
              <label>
                <span>Nombre</span>
                <input
                  value={newFavorite.name}
                  onChange={e => setNewFavorite(s => ({ ...s, name: e.target.value }))}
                  placeholder="Ej. Cañón del Sumidero"
                  disabled={creating}
                />
              </label>
              <label>
                <span>Ubicación</span>
                <input
                  value={newFavorite.place}
                  onChange={e => setNewFavorite(s => ({ ...s, place: e.target.value }))}
                  placeholder="Ej. Chiapas, México"
                  disabled={creating}
                />
              </label>
            </div>
            {createError && <p className="form-error">{createError}</p>}
            <div className="profile-add-actions">
              <button type="button" className="btn btn-ghost" onClick={handleAddToggle} disabled={creating}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar favorito'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="profile-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="profile-empty">
            <div className="profile-empty-illustration" aria-hidden>🌌</div>
            <h3>Sin favoritos todavía</h3>
            <p>Sumá los lugares que querés visitar y mantenelos siempre a mano.</p>
            {!showAddForm && (
              <button className="btn btn-primary" onClick={handleAddToggle}>
                Comenzar ahora
              </button>
            )}
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map(f => (
              <FavoriteItem key={f.id} item={f} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
