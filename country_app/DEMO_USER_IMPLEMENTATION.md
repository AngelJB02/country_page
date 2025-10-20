# Implementación de Excepción para Usuario Demo

## Descripción
Se ha implementado una excepción especial para el usuario "Demo" que restringe sus reservas únicamente a viernes y domingos con horarios específicos limitados.

## Horarios Específicos para Usuario Demo
- **Viernes**: 3:30pm a 4:30pm (clases cada 30 minutos)
  - 15:30 - 16:00
  - 16:00 - 16:30
- **Domingo**: 8:00am a 10:30am (clases cada 30 minutos)  
  - 08:00 - 08:30
  - 08:30 - 09:00
  - 09:00 - 09:30
  - 09:30 - 10:00
  - 10:00 - 10:30
  - 10:30 - 11:00

## Cambios Realizados

### 1. Función `isWorkingDay` (Líneas 329-339)
**Antes:**
```javascript
const isWorkingDay = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 2 || dayOfWeek === 0;
};
```

**Después:**
```javascript
const isWorkingDay = (date) => {
  const dayOfWeek = date.getDay();
  
  // Excepción para usuario Demo: solo puede reservar viernes (5) y domingo (0)
  if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
    return dayOfWeek === 5 || dayOfWeek === 0;
  }
  
  // Para todos los demás usuarios: Martes a Domingo
  return dayOfWeek >= 2 || dayOfWeek === 0;
};
```

### 2. Lógica de Días Válidos en useEffect (Líneas 84-108)
**Antes:**
```javascript
const diasValidos = ['martes','miercoles','jueves','viernes','sabado','domingo'];
```

**Después:**
```javascript
// Días válidos según el usuario
let diasValidos;
if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
  // Usuario Demo solo puede reservar viernes y domingo
  diasValidos = ['viernes','domingo'];
} else {
  // Todos los demás usuarios
  diasValidos = ['martes','miercoles','jueves','viernes','sabado','domingo'];
}
```

### 3. Validación en Confirmación de Reserva (Líneas 500-507)
**Nuevo código agregado:**
```javascript
// Verificar restricción especial para usuario Demo
if (currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
  const dayOfWeek = selectedDate.getDay();
  if (dayOfWeek !== 5 && dayOfWeek !== 0) { // No es viernes (5) ni domingo (0)
    toast.error('Como usuario Demo, solo puedes reservar los viernes y domingos.');
    return;
  }
}
```

### 4. Función `fetchHorariosDia` Modificada (Líneas 764-795)
**Nueva funcionalidad agregada:**
```javascript
// Verificar si es usuario Demo y aplicar horarios específicos
if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
  let horariosDemo = [];
  
  if (diaSemana === 'viernes') {
    // Viernes: 3:30pm a 4:30pm (cada 30 min)
    horariosDemo = [
      { id: 'demo_v1', hora: '15:30:00', turno: 'tarde', dia_semana: 'viernes' },
      { id: 'demo_v2', hora: '16:00:00', turno: 'tarde', dia_semana: 'viernes' }
    ];
  } else if (diaSemana === 'domingo') {
    // Domingo: 8:00am a 10:30am (cada 30 min)
    horariosDemo = [
      { id: 'demo_d1', hora: '08:00:00', turno: 'mañana', dia_semana: 'domingo' },
      { id: 'demo_d2', hora: '08:30:00', turno: 'mañana', dia_semana: 'domingo' },
      // ... más horarios
    ];
  }
  
  setHorariosDia(horariosDemo);
  return;
}
```

### 4. Mensaje de No Disponibilidad Personalizado (Líneas 1050-1063)
**Antes:**
```javascript
<p>Los lunes no hay horarios disponibles.</p>
<p>Horario laboral: <strong>Martes a Domingo</strong></p>
```

**Después:**
```javascript
{currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo' ? (
  <>
    <p>Como usuario Demo, solo puedes reservar viernes y domingos.</p>
    <p>Horario Demo: <strong>Viernes y Domingo</strong></p>
  </>
) : (
  <>
    <p>Los lunes no hay horarios disponibles.</p>
    <p>Horario laboral: <strong>Martes a Domingo</strong></p>
  </>
)}
```

## Funcionalidad Implementada

### Para Usuario "Demo":
- ✅ Solo puede ver y seleccionar viernes y domingos en el calendario
- ✅ Horarios limitados específicos por día:
  - **Viernes**: Solo 15:30-16:00 y 16:00-16:30
  - **Domingo**: Solo 08:00-08:30, 08:30-09:00, 09:00-09:30, 09:30-10:00, 10:00-10:30, 10:30-11:00
- ✅ Validación extra en el formulario de reserva
- ✅ Mensaje personalizado cuando intenta acceder a días no permitidos
- ✅ El resto de usuarios no se ven afectados

### Para Usuarios Normales:
- ✅ Mantienen acceso completo a martes-domingo
- ✅ Sin cambios en su experiencia de usuario
- ✅ Funcionalidad original intacta

## Verificación
La excepción funciona verificando:
1. Que el usuario actual existe (`currentUser`)
2. Que tiene un nombre (`currentUser.nombre`)
3. Que el nombre en minúsculas es exactamente "demo"

## Días de la Semana (JavaScript)
- 0 = Domingo ✅ (Demo)
- 1 = Lunes
- 2 = Martes
- 3 = Miércoles
- 4 = Jueves
- 5 = Viernes ✅ (Demo)
- 6 = Sábado

## Casos de Uso Cubiertos
1. **Usuario Demo accede al calendario**: Solo ve viernes y domingos como disponibles
2. **Usuario Demo intenta reservar en día no permitido**: Recibe mensaje de error específico
3. **Usuario Demo en modal de fecha no permitida**: Ve mensaje personalizado
4. **Usuarios normales**: Funcionamiento sin cambios
5. **Validación a nivel de formulario**: Doble verificación en el envío de reserva