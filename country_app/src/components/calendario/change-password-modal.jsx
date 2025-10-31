"use client"

import React, { useState } from 'react'
import Button from './ui/button'
import './css/booking-modal.css'
import { toast } from 'react-toastify'

export function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (newPass.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast.success('Contraseña actualizada')
    onClose()
    setOldPass('')
    setNewPass('')
    setConfirmPass('')
  }

  return (
    <div className="bm-overlay">
      <div className="bm-backdrop" onClick={onClose} />
      <div className="bm-modal">
        <div className="bm-header">
          <h3 className="bm-title">Cambiar contraseña</h3>
          <p className="bm-subtitle">Introduce tu contraseña actual y la nueva.</p>
        </div>

        <div className="bm-body">
          <div className="bm-row" style={{flexDirection:'column',gap:8}}>
            <label className="bm-label">Contraseña actual</label>
            <input className="bm-value" type="password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} />
          </div>
          <div className="bm-row" style={{flexDirection:'column',gap:8}}>
            <label className="bm-label">Nueva contraseña</label>
            <input className="bm-value" type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
          </div>
          <div className="bm-row" style={{flexDirection:'column',gap:8}}>
            <label className="bm-label">Confirmar contraseña</label>
            <input className="bm-value" type="password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} />
          </div>
        </div>

        <div className="bm-actions">
          <Button variant="outline" onClick={onClose} className="bm-btn bm-btn--outline">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bm-btn bm-btn--primary">{loading ? 'Guardando...' : 'Cambiar contraseña'}</Button>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal
