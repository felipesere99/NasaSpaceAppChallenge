import React, { useEffect, useState } from 'react'

export default function FavoriteItem({ item, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: item.name || '', place: item.place || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!editing) {
      setForm({ name: item.name || '', place: item.place || '' })
      setError(null)
    }
  }, [item, editing])

  const resetForm = () => {
    setForm({ name: item.name || '', place: item.place || '' })
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.place.trim()) {
      setError('Completá ambos campos antes de guardar.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/favorites/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Error al guardar')
      const updated = await res.json()
      onUpdate(updated)
      setEditing(false)
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/favorites/${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      // notificar al padre para filtrar
      onUpdate({ ...item, _deleted: true })
    } catch (e) {
      console.error(e)
    }
  }

  if (item._deleted) return null

  return (
    <article className={`fav-card ${editing ? 'is-editing' : ''}`}>
      {!editing ? (
        <>
          <div className="fav-meta">
            <span className="fav-pill">Favorito</span>
            <h3>{item.name}</h3>
            <p className="fav-place">{item.place}</p>
          </div>
          <div className="fav-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(true)}>Editar</button>
            <button className="btn btn-danger btn-sm" type="button" onClick={handleDelete}>Eliminar</button>
          </div>
        </>
      ) : (
        <div className="fav-edit">
          <label>
            <span>Nombre</span>
            <input
              value={form.name}
              onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
              placeholder="Nombre"
              disabled={saving}
            />
          </label>
          <label>
            <span>Ubicación</span>
            <input
              value={form.place}
              onChange={e => setForm(s => ({ ...s, place: e.target.value }))}
              placeholder="Ubicación"
              disabled={saving}
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="fav-edit-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => { resetForm(); setEditing(false) }} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
