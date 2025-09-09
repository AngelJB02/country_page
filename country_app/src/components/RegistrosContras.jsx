import React from "react";

const RegistrosContras = ({ password }) => {
  const requirements = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Al menos 1 mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Al menos 1 número", valid: /\d/.test(password) },
  ];

  return (
    <div className="password-requirements">
      <h4>La contraseña debe tener:</h4>
      <ul>
        {requirements.map((req, i) => (
          <li key={i} className={req.valid ? "valid" : ""}>
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegistrosContras;
