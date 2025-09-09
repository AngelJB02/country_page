// src/utils/roleRedirects.js
export const roleRedirects = {
  admin: "/dashboard-admin",
  instructor: "/dashboard-instructor",
  contabilidad: "/dashboard-contabilidad",
  viewer: "/dashboard-viewer",
  creadorcuentas: "/registro",
  cliente: "/MenuCalendario"
};

export const getRedirectRoute = (rol) => {
  return roleRedirects[rol] || "/MenuCalendario"; // ruta por defecto
};
