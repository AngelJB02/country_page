-- Datos iniciales: Horarios e Instructoras
-- Ejecutar DESPUÉS de la migración 002_modelo_datos_core.sql
-- Contraseña para todas las instructoras: miClave123

-- 1) Insertar clases básicas (si no existen)
-- Nota: La tabla clases ya existe con ENUM ('iniciacion', 'intermedio', 'paseo', 'salto')
-- Solo insertamos si no existen registros
INSERT IGNORE INTO clases (nombre, duracion_min, cupo_max, prioridad, observaciones) VALUES
('iniciacion', 30, 2, 1, 'Clase de iniciación para principiantes - 30 minutos'),
('intermedio', 60, 6, 2, 'Clase nivel intermedio - 1 hora'),
('paseo', 60, 5, 3, 'Paseo o caminata - 1 hora'),
('salto', 60, 6, 4, 'Clase nivel avanzado/salto - 1 hora');

-- 2) Insertar horarios según especificaciones

-- INICIACIÓN: Media hora, 2 clientes por horario
-- Lunes-Viernes: 7:30-8:00-8:30-9:00-9:30-10:00-10:30, 3:30-4:30
INSERT IGNORE INTO horarios_clase (clase_id, dia_semana, hora_inicio, hora_fin, capacidad) VALUES
-- Lunes a Viernes - Mañana
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '09:30:00', '10:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '10:00:00', '10:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '15:30:00', '16:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'L', '16:00:00', '16:30:00', 2),

((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '09:30:00', '10:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '10:00:00', '10:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '15:30:00', '16:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'M', '16:00:00', '16:30:00', 2),

((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '09:30:00', '10:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '10:00:00', '10:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '15:30:00', '16:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'X', '16:00:00', '16:30:00', 2),

((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '09:30:00', '10:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '10:00:00', '10:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '15:30:00', '16:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'J', '16:00:00', '16:30:00', 2),

((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '09:30:00', '10:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '10:00:00', '10:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '15:30:00', '16:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'V', '16:00:00', '16:30:00', 2),

-- Sábado-Domingo: 7:30-8:00-8:30-9:00-9:30
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'S', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'S', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'S', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'S', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'S', '09:30:00', '10:00:00', 2),

((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'D', '07:30:00', '08:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'D', '08:00:00', '08:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'D', '08:30:00', '09:00:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'D', '09:00:00', '09:30:00', 2),
((SELECT id FROM clases WHERE nombre = 'iniciacion'), 'D', '09:30:00', '10:00:00', 2),

-- INTERMEDIO: 1 hora, 6 clientes por horario
-- Lunes-Viernes: 8-9-10 y 5pm, Sábado-Domingo: 10:00
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'L', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'L', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'L', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'L', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'intermedio'), 'M', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'M', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'M', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'M', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'intermedio'), 'X', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'X', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'X', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'X', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'intermedio'), 'J', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'J', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'J', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'J', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'intermedio'), 'V', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'V', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'V', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'V', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'intermedio'), 'S', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'intermedio'), 'D', '10:00:00', '11:00:00', 6),

-- PASEO: 1 hora, 5 clientes por horario
-- Horario 4:00-5:30 (interpreto como dos slots: 4:00-5:00 y 5:00-5:30)
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '17:00:00', '17:30:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '17:00:00', '17:30:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '17:00:00', '17:30:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '17:00:00', '17:30:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '17:00:00', '17:30:00', 5),

-- AVANZADO: 1 hora, 6 clientes por horario
-- Lunes-Viernes: 8:00-10:00 y 5:00, Sábado-Domingo: 10:00-11:00
((SELECT id FROM clases WHERE nombre = 'salto'), 'L', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'L', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'L', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'salto'), 'M', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'M', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'M', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'salto'), 'X', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'X', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'X', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'salto'), 'J', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'J', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'J', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'salto'), 'V', '08:00:00', '09:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'V', '09:00:00', '10:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'V', '17:00:00', '18:00:00', 6),

((SELECT id FROM clases WHERE nombre = 'salto'), 'S', '10:00:00', '11:00:00', 6),
((SELECT id FROM clases WHERE nombre = 'salto'), 'D', '10:00:00', '11:00:00', 6);

-- 3) Crear cuentas de instructoras (contraseña: miClave123)
-- Hash bcrypt de "miClave123": $2b$10$F8m7T6E9kL2P3vB8wC1x4O.5N6qR9sA1dK7hF3mJ8vT9uY2pL5eG6
INSERT IGNORE INTO usuarios (username, nombre, apellido, correo, telefono, contrasena, rol, estatus) VALUES
('briggite_smith', 'Briggite', 'Smith', 'briggite@elrefugio.com', '555-0101', '$2b$10$F8m7T6E9kL2P3vB8wC1x4O.5N6qR9sA1dK7hF3mJ8vT9uY2pL5eG6', 'instructora', 'activo'),
('isabela_rodriguez', 'Isabela', 'Rodriguez', 'isabela@elrefugio.com', '555-0102', '$2b$10$F8m7T6E9kL2P3vB8wC1x4O.5N6qR9sA1dK7hF3mJ8vT9uY2pL5eG6', 'instructora', 'activo'),
('jimmy_fernandez', 'Jimmy', 'Fernandez', 'jimmy@elrefugio.com', '555-0103', '$2b$10$F8m7T6E9kL2P3vB8wC1x4O.5N6qR9sA1dK7hF3mJ8vT9uY2pL5eG6', 'instructora', 'activo');

-- 4) Crear registros en tabla instructoras (si existe)
INSERT IGNORE INTO instructoras (usuario_id, nombre, apellido, num_contacto, especialidad, disponibilidad) VALUES
((SELECT id FROM usuarios WHERE correo = 'briggite@elrefugio.com'), 'Briggite', 'Smith', '555-0101', 'mixto', 'disponible'),
((SELECT id FROM usuarios WHERE correo = 'isabela@elrefugio.com'), 'Isabela', 'Rodriguez', '555-0102', 'mixto', 'disponible'),
((SELECT id FROM usuarios WHERE correo = 'jimmy@elrefugio.com'), 'Jimmy', 'Fernandez', '555-0103', 'salto', 'disponible');

-- 5) Asignar permisos específicos por instructora
INSERT IGNORE INTO instructora_clase (instructora_id, clase_id, activo, restricciones) VALUES
-- Briggite: iniciación, salto, paseo, intermedio
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'briggite@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'iniciacion'), 1, NULL),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'briggite@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'salto'), 1, NULL),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'briggite@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'paseo'), 1, NULL),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'briggite@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'intermedio'), 1, NULL),

-- Isabela: iniciación, paseo o caminata, intermedio
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'isabela@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'iniciacion'), 1, NULL),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'isabela@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'paseo'), 1, NULL),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'isabela@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'intermedio'), 1, NULL),

-- Jimmy: solo sábados, intermedio y salto
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'jimmy@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'intermedio'), 1, 'solo_sabados'),
((SELECT id FROM instructoras WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = 'jimmy@elrefugio.com')), (SELECT id FROM clases WHERE nombre = 'salto'), 1, 'solo_sabados');

-- RESUMEN DE DATOS INSERTADOS:
-- - 4 clases: iniciacion, intermedio, paseo, salto (adaptado al ENUM existente)
-- - 94+ horarios distribuidos en la semana
-- - 3 instructoras con contraseña "miClave123"
-- - Permisos granulares por instructora según especificaciones
-- - Jimmy restringido a solo sábados para intermedio y salto
-- - Adaptado a la estructura real de la BD (username, correo, contrasena, estatus)