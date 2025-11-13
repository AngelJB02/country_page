-- Script para agregar la columna nivel_clase a la tabla asistencias
-- Esta columna guarda el nivel del cliente al momento de tomar la clase
-- Ejecutar este script en la base de datos para agregar el campo de nivel de clase

ALTER TABLE asistencias 
ADD COLUMN nivel_clase ENUM('paseo', 'iniciacion', 'intermedio', 'avanzado') 
NULL 
COMMENT 'Nivel del cliente al momento de tomar esta clase'
AFTER asistio;

-- Verificar que la columna se agregó correctamente
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'asistencias' 
-- AND COLUMN_NAME = 'nivel_clase';

