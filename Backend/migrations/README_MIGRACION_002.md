# Migración 002: Modelo de Datos Core

En esta migración dejamos lista la base de datos para las nuevas funcionalidades. El foco es solo la estructura que el backend utilizará después.

## Columnas nuevas en tablas existentes

### usuarios (3 campos nuevos)

#### dia_corte (INT)
- **Propósito**: Definir el día del mes (1-28) cuando se debe cobrar a cada usuario
- **Problema que resuelve**: No hay forma de saber cuándo cobrar a cada cliente
- **Beneficios**: 
  - Personalización del ciclo de pago por usuario
  - Base para generar reportes de cobranza organizados por fecha
  - Permite distribuir los cobros a lo largo del mes

#### ultimo_pago (DATE)
- **Propósito**: Registrar la última fecha en que el usuario realizó un pago
- **Problema que resuelve**: No hay historial de pagos para seguimiento
- **Beneficios**:
  - Identificar clientes con pagos atrasados
  - Calcular días desde último pago
  - Base para reportes de morosidad

#### proxima_alerta (DATE)
- **Propósito**: Marcar cuándo enviar el próximo recordatorio de pago
- **Problema que resuelve**: Envío desordenado o spam de recordatorios
- **Beneficios**:
  - Control de frecuencia de recordatorios
  - Evita molestar al cliente con recordatorios diarios
  - Programación inteligente de notificaciones

### caballos (2 campos nuevos)

#### veces_usado_semana (INT)
- **Propósito**: Contar cuántas veces se ha usado el caballo en la semana actual
- **Problema que resuelve**: Sobreuso de caballos sin control
- **Beneficios**:
  - Protección del bienestar animal
  - Cumplimiento de regulaciones (máximo 3 usos/semana)
  - Distribución equitativa del trabajo entre caballos

#### semana_inicio (DATE)
- **Propósito**: Marcar el inicio del período semanal para el contador
- **Problema que resuelve**: No hay forma de determinar cuándo reiniciar el contador
- **Beneficios**:
  - Control preciso de períodos semanales
  - Flexibilidad para definir qué día inicia la semana
  - Base para reportes de uso histórico

## Tablas nuevas

### horarios_clase
- **Propósito**: Definir slots específicos de tiempo por clase, día de semana y hora
- **Problema que resuelve**: Horarios genéricos causan confusión y overbooking
- **Beneficios**:
  - Slots exactos (ej: 8:00-8:30, 8:30-9:00) en lugar de rangos amplios
  - Control de capacidad por slot
  - Consultas precisas de disponibilidad
  - Evita conflictos de horarios
- **Campos clave**:
  - clase_id: vincula con tabla clases
  - dia_semana: L,M,X,J,V,S,D
  - hora_inicio/hora_fin: slot exacto
  - capacidad: cuántas personas pueden reservar ese slot
  - activo: permite deshabilitar slots temporalmente

### caballos_descansos
- **Propósito**: Registrar períodos cuando un caballo está en descanso o baja
- **Problema que resuelve**: No hay forma de marcar caballos no disponibles temporalmente
- **Beneficios**:
  - Exclude automáticamente caballos lesionados/enfermos de las reservas
  - Documentación del motivo del descanso
  - Control de períodos de recuperación
  - Reportes de salud animal
- **Campos clave**:
  - caballo_id: caballo en descanso
  - fecha_inicio/fecha_fin: período del descanso
  - motivo: razón del descanso (lesión, enfermedad, etc.)
  - activo: si el descanso está vigente

### asistencias
- **Propósito**: Registrar si la instructora asistió a la clase reservada
- **Problema que resuelve**: No hay control de asistencia del personal
- **Beneficios**:
  - Accountability de instructoras
  - Base para cálculo de nómina
  - Identificación de patrones de ausentismo
  - Reportes operativos para administración
- **Campos clave**:
  - reserva_id: vincula con la reserva específica
  - instructora_id: instructora asignada
  - asistio: presente/ausente/justificado
  - registrado_en: timestamp del registro

### instructora_clase
- **Propósito**: Definir qué clases puede dar cada instructora (relación muchas-a-muchas)
- **Problema que resuelve**: El campo `especialidad` es muy limitado para permisos granulares
- **Beneficios**:
  - Control específico por instructora y clase
  - Flexibilidad para activar/desactivar permisos sin perder datos
  - Restricciones especiales (ej: "solo_sabados", "solo_mananas")
  - Escalabilidad al agregar nuevas clases
- **Campos clave**:
  - instructora_id: instructora específica
  - clase_id: clase que puede impartir
  - activo: permite deshabilitar temporalmente sin borrar
  - restricciones: condiciones especiales (días, horarios, etc.)
- **Ejemplo práctico**:
  ```
  Briggite puede dar: iniciación + intermedio
  Isabela puede dar: iniciación + salto
  Jimmy puede dar: salto (solo sábados)
  ```

## Alcance

- Solo cambios de estructura (tablas y columnas)
- Sin reglas de negocio en la base de datos
- La carga de datos inicial (si aplica) se hará desde el backend

## Decisiones implementadas

- **Relación instructora–clase**: Se implementó tabla `instructora_clase` (muchas-a-muchas) para control granular de permisos por instructora y clase.
- **Ventajas**: Flexibilidad total, restricciones especiales, escalabilidad.
- **Uso**: Cada instructora puede tener permisos específicos para diferentes clases con condiciones particulares.

## Cómo ejecutar

En PowerShell (ajusta host/credenciales según tu entorno):

```powershell
# Con BD seleccionada en el comando
mysql -h 149.56.44.53 -u country_v2 -p elrefugiocountryclub_v2 < Backend/migrations/002_modelo_datos_core.sql
```

Verificar cambios mínimos:

```powershell
mysql -h 149.56.44.53 -u country_v2 -p -e "DESCRIBE usuarios;" elrefugiocountryclub_v2
mysql -h 149.56.44.53 -u country_v2 -p -e "DESCRIBE caballos;" elrefugiocountryclub_v2
mysql -h 149.56.44.53 -u country_v2 -p -e "SHOW CREATE TABLE horarios_clase;" elrefugiocountryclub_v2
```

## Notas de compatibilidad

- Cambios aditivos: no eliminan ni modifican datos existentes.
- Índices incluidos para consultas comunes; claves foráneas se pueden agregar en una migración posterior.
 
