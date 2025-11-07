-- Migración 002: Modelo de datos core (sin automatizaciones)
-- Enfoque: solo estructura e índices mínimos. No incluye triggers ni procedimientos.
-- Requisitos: MySQL 8.x, ejecutar con la BD seleccionada (USE <db> previamente o via CLI).

-- 1) usuarios: campos para gestión de pagos (sin lógica automatizada)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS dia_corte INT NULL DEFAULT 1 COMMENT 'Día del mes para corte (1-28)';

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS ultimo_pago DATE NULL COMMENT 'Última fecha de pago registrada';

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS proxima_alerta DATE NULL COMMENT 'Próxima fecha sugerida para recordar pago';

-- Índice sugerido para consultas por día de corte
CREATE INDEX IF NOT EXISTS idx_usuarios_dia_corte ON usuarios (dia_corte);


-- 2) caballos: contadores de uso y periodo semanal (sin triggers)
ALTER TABLE caballos
  ADD COLUMN IF NOT EXISTS veces_usado_semana INT NOT NULL DEFAULT 0 COMMENT 'Contador de usos de la semana';

ALTER TABLE caballos
  ADD COLUMN IF NOT EXISTS semana_inicio DATE NULL COMMENT 'Inicio del periodo semanal actual';

-- Índice útil para reportes y filtros
CREATE INDEX IF NOT EXISTS idx_caballos_uso_semana ON caballos (veces_usado_semana);


-- 3) horarios_clase: slots por clase/día/hora
CREATE TABLE IF NOT EXISTS horarios_clase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clase_id INT NOT NULL,
  dia_semana ENUM('L','M','X','J','V','S','D') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  capacidad INT NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_slot (clase_id, dia_semana, hora_inicio, hora_fin),
  KEY idx_horarios_dia_activo (dia_semana, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4) caballos_descansos: períodos de descanso/baja por caballo
CREATE TABLE IF NOT EXISTS caballos_descansos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caballo_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  motivo VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  KEY idx_descanso_caballo_activo (caballo_id, activo),
  KEY idx_descanso_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5) asistencias: registro de asistencia por reserva/instructora
CREATE TABLE IF NOT EXISTS asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  instructora_id INT NOT NULL,
  asistio ENUM('presente','ausente','justificado') NOT NULL DEFAULT 'presente',
  registrado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_asistencia_instructora (instructora_id),
  KEY idx_asistencia_reserva (reserva_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6) instructora_clase: relación muchas-a-muchas para permisos granulares
CREATE TABLE IF NOT EXISTS instructora_clase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructora_id INT NOT NULL,
  clase_id INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  restricciones VARCHAR(255) NULL COMMENT 'Ej: solo_sabados, solo_mananas',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_instructora_clase (instructora_id, clase_id),
  KEY idx_instructora_activo (instructora_id, activo),
  KEY idx_clase_activo (clase_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- NOTAS:
-- - No se crean claves foráneas aquí para evitar romper datos existentes; se pueden añadir en una migración posterior.
-- - La lógica (p.ej., conteos de uso/semanas y alertas) se implementará desde backend.
-- - La tabla instructora_clase permite control granular de permisos por instructora y clase.
-- - Los datos iniciales (horarios e instructoras) están en el archivo 003_datos_iniciales.sql
-- - No se crean claves foráneas aquí para evitar romper datos existentes; se pueden añadir en una migración posterior.
-- - La lógica (p.ej., conteos de uso/semanas y alertas) se implementará desde backend.
-- - Se incluyen todos los horarios e instructoras según especificaciones del negocio.
-- - La tabla instructora_clase permite control granular de permisos por instructora y clase.
-- - Las contraseñas son hashes de ejemplo; deben cambiarse en primer login.
