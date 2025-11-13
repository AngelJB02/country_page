-- Script para agregar la columna metodo_pago a la tabla contabilidad
-- Ejecutar este script en la base de datos para agregar el campo de método de pago

ALTER TABLE contabilidad 
ADD COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'link_pago') 
DEFAULT 'efectivo' 
AFTER estatus_pago;

-- Verificar que la columna se agregó correctamente
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'contabilidad' 
-- AND COLUMN_NAME = 'metodo_pago';

