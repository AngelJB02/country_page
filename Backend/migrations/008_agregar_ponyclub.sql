-- Migración 008: Agregar nivel "ponyclub"
-- Ponyclub es igual que iniciación: 30 min, cupo 2, cooldown 0, 1 instructora por alumno
-- Nueva instructora: Tamara Chico (solo puede dar ponyclub)
-- Ejecutar en BD local: country_refugiodb

-- 1) Añadir 'ponyclub' al ENUM de la tabla clases
ALTER TABLE clases 
MODIFY COLUMN nombre ENUM('iniciacion', 'intermedio', 'avanzado', 'paseo', 'ponyclub') NULL;

-- 2) Añadir 'ponyclub' al ENUM de nivel_clase en asistencias
ALTER TABLE asistencias 
MODIFY COLUMN nivel_clase ENUM('paseo', 'iniciacion', 'intermedio', 'avanzado', 'ponyclub') NULL 
COMMENT 'Nivel del cliente al momento de tomar esta clase';

-- 3) Añadir 'ponyclub' al ENUM de tipo_nivel en usuarios
ALTER TABLE usuarios 
MODIFY COLUMN tipo_nivel ENUM('paseo', 'iniciacion', 'intermedio', 'avanzado', 'ponyclub') NULL;

-- 4) Insertar la clase ponyclub (solo si no existe)
INSERT INTO clases (nombre, duracion_min, cupo_max, prioridad, observaciones)
SELECT 'ponyclub', 30, 2, 5, 'Clase Ponyclub para principiantes - 30 minutos (igual que iniciación)'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM clases WHERE nombre = 'ponyclub');

-- 4b) Copiar horarios de iniciación para ponyclub (solo si no tiene horarios aún)
INSERT INTO horarios_clase (clase_id, dia_semana, hora_inicio, hora_fin, capacidad, activo)
SELECT 
  (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1),
  hc.dia_semana,
  hc.hora_inicio,
  hc.hora_fin,
  hc.capacidad,
  hc.activo
FROM horarios_clase hc
WHERE hc.clase_id = (SELECT id FROM clases WHERE nombre = 'iniciacion')
AND NOT EXISTS (
  SELECT 1 FROM horarios_clase WHERE clase_id = (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1)
);

-- 5) Agregar horarios vespertinos extendidos para ponyclub (16:30 a 18:30, todos los días)
INSERT INTO horarios_clase (clase_id, dia_semana, hora_inicio, hora_fin, capacidad, activo)
SELECT (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1), d.dia, t.inicio, t.fin, 2, 1
FROM
  (SELECT 'L' as dia UNION SELECT 'M' UNION SELECT 'X' UNION SELECT 'J' UNION SELECT 'V' UNION SELECT 'S' UNION SELECT 'D') d,
  (SELECT '16:30:00' as inicio, '17:00:00' as fin UNION SELECT '17:00:00','17:30:00' UNION SELECT '17:30:00','18:00:00' UNION SELECT '18:00:00','18:30:00') t
WHERE NOT EXISTS (
  SELECT 1 FROM horarios_clase 
  WHERE clase_id = (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1)
    AND dia_semana = d.dia AND hora_inicio = t.inicio
);

-- 5b) Agregar 16:00-16:30 para sábado y domingo (que no lo tenían)
INSERT INTO horarios_clase (clase_id, dia_semana, hora_inicio, hora_fin, capacidad, activo)
SELECT (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1), d.dia, '16:00:00', '16:30:00', 2, 1
FROM (SELECT 'S' as dia UNION SELECT 'D') d
WHERE NOT EXISTS (
  SELECT 1 FROM horarios_clase 
  WHERE clase_id = (SELECT id FROM clases WHERE nombre = 'ponyclub' LIMIT 1)
    AND dia_semana = d.dia AND hora_inicio = '16:00:00'
);

-- 6) La instructora Tamara Chico se creará desde la plataforma (no por SQL).
