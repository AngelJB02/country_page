-- Crear tabla para horarios disponibles de instructoras
CREATE TABLE instructora_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructora_id INT NOT NULL,
    dia_semana ENUM('L', 'M', 'X', 'J', 'V', 'S', 'D') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo TINYINT(1) DEFAULT 1 NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_instructora_horario UNIQUE (instructora_id, dia_semana, hora_inicio, hora_fin),
    FOREIGN KEY (instructora_id) REFERENCES instructoras(id) ON DELETE CASCADE
) COLLATE utf8mb4_general_ci;

-- Índices para optimización
CREATE INDEX idx_instructora_horarios_dia_activo ON instructora_horarios (dia_semana, activo);
CREATE INDEX idx_instructora_horarios_instructora_activo ON instructora_horarios (instructora_id, activo);