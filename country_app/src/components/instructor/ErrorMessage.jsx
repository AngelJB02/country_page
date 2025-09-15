import React from 'react';

const ErrorMessage = ({ message }) => (
  <div style={{ background:'linear-gradient(135deg, #ff6b6b, #ee5a24)', color:'white', padding:'1rem', borderRadius:'var(--radius-md)', marginBottom:'1rem', textAlign:'center', fontWeight:'600' }}>
    {message}
  </div>
);

export default ErrorMessage;
