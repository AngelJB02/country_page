export default function CalendarGrid({ onSelectDate, availability }) {
  const today = new Date();

  const days = [...Array(7)].map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <button
          key={day.toISOString()}
          onClick={() => onSelectDate(day)}
          className="p-3 rounded bg-gray-200 hover:bg-gray-300"
        >
          {day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}
        </button>
      ))}
    </div>
  );
}
