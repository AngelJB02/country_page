import BookingForm from "./BookingForm";

export default function DateModal({ date, availability, onClose, onConfirm, setSelectedTime }) {
  if (!date) return null;

  const horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          Reservar para {date.toLocaleDateString("es-ES")}
        </h2>

        <div className="mb-4">
          {horarios.map((hora) => (
            <button
              key={hora}
              onClick={() => setSelectedTime(hora)}
              className="mr-2 mb-2 px-3 py-2 bg-blue-200 rounded hover:bg-blue-300"
            >
              {hora}
            </button>
          ))}
        </div>

        <BookingForm onConfirm={onConfirm} />
        <button onClick={onClose} className="mt-4 text-red-500">Cancelar</button>
      </div>
    </div>
  );
}
