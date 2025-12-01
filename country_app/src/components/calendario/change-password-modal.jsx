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
    if (!oldPass) {
      toast.error('Debes ingresar tu contraseña actual')
      return
    }
    if (newPass.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    // Obtener datos del usuario desde localStorage
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) {
      toast.error('No se encontró información del usuario');
      return;
    }

    let userData;
    try {
      userData = JSON.parse(userDataStr);
    } catch (error) {
      toast.error('Error al leer datos del usuario');
      return;
    }

    setLoading(true)
    
    try {
      // Actualizar contraseña enviando la contraseña actual para validación
      const updateResponse = await fetch(`http://212.227.238.213/api/api/users/update-password/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPass,
          currentPassword: oldPass
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Error al actualizar la contraseña');
      }

      // Obtener información completa del usuario para el email
      const userInfoResponse = await fetch(`http://212.227.238.213/api/api/users/${userData.id}`);
      let userEmail = null;
      let userName = userData.nombre;
      let username = localStorage.getItem('username');

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        console.log('🔍 Información del usuario obtenida:', userInfo);
        userEmail = userInfo.usuario?.correo;
        userName = userInfo.usuario?.nombre || userData.nombre;
        username = userInfo.usuario?.username || username;
        console.log('📧 Email del usuario:', userEmail);
        console.log('👤 Nombre del usuario:', userName);
        console.log('🔤 Username:', username);
      } else {
        console.error('❌ Error al obtener información del usuario:', userInfoResponse.status);
      }

      // Enviar email con nueva contraseña si el usuario tiene email
      console.log('🔍 Verificando si enviar email...');
      console.log('📧 userEmail:', userEmail);
      console.log('✅ ¿Tiene email válido?', !!(userEmail && userEmail.trim()));
      
      if (userEmail && userEmail.trim()) {
        console.log('📨 Intentando enviar email con datos:', {
          email: userEmail,
          nombre: userName,
          username: username,
          newPassword: newPass
        });
        
        try {
          const emailResponse = await fetch('http://212.227.238.213/api/api/email/send-updated-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmail,
              nombre: userName,
              username: username,
              newPassword: newPass
            })
          });

          console.log('📧 Respuesta del email:', emailResponse.status);
          
          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            console.log('✅ Email enviado exitosamente:', emailResult);
            toast.success('Contraseña actualizada y enviada por email');
          } else {
            const emailError = await emailResponse.json();
            console.error('❌ Error en respuesta del email:', emailError);
            throw new Error('Error al enviar email');
          }
        } catch (emailError) {
          console.error('❌ Error enviando email:', emailError);
          toast.success('Contraseña actualizada correctamente (no se pudo enviar por email)');
        }
      } else {
        console.log('⚠️ Usuario sin email registrado, no se enviará email');
        toast.success('Contraseña actualizada correctamente');
      }

      // Limpiar el formulario y cerrar
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      onClose();

    } catch (error) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
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
