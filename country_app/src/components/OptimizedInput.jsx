import React, { memo } from 'react';

const OptimizedInput = memo(({ 
  type = "text", 
  id, 
  name, 
  value, 
  onChange, 
  required = false,
  label,
  placeholder,
  min,
  max,
  rows
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          required={required}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">Selecciona una opción</option>
          <option value="boda">Boda</option>
          <option value="corporativo">Evento Corporativo</option>
          <option value="familiar">Celebración Familiar</option>
          <option value="retiro">Retiro/Taller</option>
          <option value="otro">Otro</option>
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
        />
      )}
    </div>
  );
});

OptimizedInput.displayName = 'OptimizedInput';

export default OptimizedInput;
