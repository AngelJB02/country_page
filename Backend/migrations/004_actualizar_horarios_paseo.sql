-- Actualizar horarios de PASEO
-- LUN A VI - 8 AM a 12 PM - VESPERTINO 4, 5 PM
-- Sábados y Domingos - 8 AM a 12 PM
-- Duración: 1 hora, Capacidad: 5 espacios

-- Primero eliminar los horarios antiguos de paseo
DELETE FROM horarios_clase 
WHERE clase_id = (SELECT id FROM clases WHERE nombre = 'paseo');

-- Insertar los nuevos horarios de paseo
-- Lunes a Viernes
INSERT INTO horarios_clase (clase_id, dia_semana, hora_inicio, hora_fin, capacidad) VALUES
-- Lunes
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '12:00:00', '13:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'L', '17:00:00', '18:00:00', 5),

-- Martes
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '12:00:00', '13:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'M', '17:00:00', '18:00:00', 5),

-- Miércoles
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '12:00:00', '13:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'X', '17:00:00', '18:00:00', 5),

-- Jueves
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '12:00:00', '13:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'J', '17:00:00', '18:00:00', 5),

-- Viernes
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '12:00:00', '13:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '16:00:00', '17:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'V', '17:00:00', '18:00:00', 5),

-- Sábado
((SELECT id FROM clases WHERE nombre = 'paseo'), 'S', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'S', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'S', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'S', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'S', '12:00:00', '13:00:00', 5),

-- Domingo
((SELECT id FROM clases WHERE nombre = 'paseo'), 'D', '08:00:00', '09:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'D', '09:00:00', '10:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'D', '10:00:00', '11:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'D', '11:00:00', '12:00:00', 5),
((SELECT id FROM clases WHERE nombre = 'paseo'), 'D', '12:00:00', '13:00:00', 5);

