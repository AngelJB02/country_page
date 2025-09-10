import React from "react";

const UsersTable = () => {
  const users = [
    { id: 1, nombre: "Juan Pérez", email: "juan@test.com", estado: "Activo" },
    { id: 2, nombre: "Ana Gómez", email: "ana@test.com", estado: "Pendiente" },
  ];

  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.nombre}</td>
            <td>{u.email}</td>
            <td>
              <span className={`status-badge status-${u.estado.toLowerCase()}`}>
                {u.estado}
              </span>
            </td>
            <td className="action-buttons">
              <button className="action-btn btn-edit">Editar</button>
              <button className="action-btn btn-delete">Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;
