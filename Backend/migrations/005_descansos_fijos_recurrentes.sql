-- Migración 005: Descansos fijos recurrentes
-- Agrega soporte para descansos fijos por día de semana y conteo de reservas durante descansos

-- Modificar fecha_inicio y fecha_fin para permitir NULL (necesario para descansos recurrentes)
ALTER TABLE descansos
  MODIFY COLUMN fecha_inicio DATE NULL COMMENT 'Fecha de inicio del descanso (NULL para descansos recurrentes)';

ALTER TABLE descansos
  MODIFY COLUMN fecha_fin DATE NULL COMMENT 'Fecha de fin del descanso (NULL para descansos recurrentes)';

-- Agregar campos a la tabla descansos para soportar descansos fijos recurrentes
ALTER TABLE descansos
  ADD COLUMN IF NOT EXISTS dia_semana ENUM('L','M','X','J','V','S','D') NULL COMMENT 'Día de la semana para descansos fijos recurrentes (L=Lunes, M=Martes, X=Miércoles, J=Jueves, V=Viernes, S=Sábado, D=Domingo)';

ALTER TABLE descansos
  ADD COLUMN IF NOT EXISTS es_recurrente TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el descanso es fijo y recurrente por día de semana';

ALTER TABLE descansos
  ADD COLUMN IF NOT EXISTS limite_reservas INT NULL COMMENT 'Límite de reservas que se pueden hacer durante este descanso. Cuando se alcanza, el descanso ya no se cuenta';

ALTER TABLE descansos
  ADD COLUMN IF NOT EXISTS reservas_realizadas INT NOT NULL DEFAULT 0 COMMENT 'Contador de reservas realizadas durante este descanso';

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_descansos_recurrente ON descansos (es_recurrente, dia_semana);
CREATE INDEX IF NOT EXISTS idx_descansos_limite ON descansos (limite_reservas, reservas_realizadas);

