// src/utils/roleRedirects.js
export const roleRedirects = {
  admin: "/admin",
  instructora: "/instructor",
  administrador: "/contabilidad",
  viewer: "/dashboard-viewer",
  creadorcuentas: "/registro",
  cliente: "/MenuCalendario"
};

export const getRedirectRoute = (rol) => {
  return roleRedirects[rol] || "/MenuCalendario"; // ruta por defecto
};
