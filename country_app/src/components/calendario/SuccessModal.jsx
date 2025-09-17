export default function SuccessModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">✅ Reserva Confirmada</h2>
        <p><strong>Nombre:</strong> {booking.nombre}</p>
        <p><strong>Actividad:</strong> {booking.actividad}</p>
        <p><strong>Fecha:</strong> {(() => {
          const fechaStr = booking.fecha.split('T')[0];
          const [year, month, day] = fechaStr.split('-');
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
        })()}</p>
        <p><strong>Hora:</strong> {booking.hora}</p>
        <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-3 py-2 rounded">
          Cerrar
        </button>
      </div>
    </div>
  );
}
