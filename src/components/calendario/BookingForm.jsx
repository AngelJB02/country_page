import { useState } from "react";

export default function BookingForm({ onConfirm }) {
  const [formData, setFormData] = useState({ nombre: "", edad: "", actividad: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        className="border p-2 mb-2 w-full"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
      />
      <input
        type="number"
        placeholder="Edad"
        className="border p-2 mb-2 w-full"
        value={formData.edad}
        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
      />
      <select
        className="border p-2 mb-2 w-full"
        value={formData.actividad}
        onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
      >
        <option value="">Selecciona actividad</option>
        <option value="iniciacion">Iniciación</option>
        <option value="paseo">Paseo</option>
        <option value="salto">Salto</option>
      </select>
      <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded">
        Confirmar Reserva
      </button>
    </form>
  );
}
