
export function TimeSlotCard({ time, capacity, bookedCount, isBookedByUser, isBlocked, onClick }) {
  const isFull = bookedCount >= capacity;
  const availableSpots = capacity - bookedCount;

  const getStateStyles = () => {
    if (isBlocked) {
      return {
        backgroundColor: "#4A2F18",
        borderColor: "#4A2F18",
        color: "white",
        cursor: "not-allowed",
      };
    }
    if (isBookedByUser) {
      return {
        backgroundColor: "#C17B4A",
        borderColor: "#C17B4A",
        color: "white",
        cursor: "pointer",
      };
    }
    if (isFull) {
      return {
        backgroundColor: "#4A2F18",
        borderColor: "#4A2F18",
        color: "white",
        cursor: "not-allowed",
      };
    }
    return {
      backgroundColor: "white",
      borderColor: "#9CAF88",
      color: "#6B4423",
      cursor: "pointer",
    };
  };

  const styles = getStateStyles();

  const cardStyle = {
    padding: "16px",
    borderRadius: "8px",
    border: `2px solid ${styles.borderColor}`,
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    cursor: styles.cursor,
    transition: "all 0.2s",
  };

  const handleMouseEnter = (e) => {
    if (!isBlocked && !isFull) {
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 68, 35, 0.15)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <div
      style={cardStyle}
      onClick={!isBlocked && !isFull ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{ fontSize: "18px", fontWeight: "600" }}>{time}</div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
          {Array.from({ length: capacity }).map((_, index) => (
            <span
              key={index}
              style={{ fontSize: "24px", opacity: index < bookedCount ? 1 : 0.3 }}
              title={index < bookedCount ? "Reservado" : "Disponible"}
            >
              🐴
            </span>
          ))}
        </div>

        <div style={{ fontSize: "12px", fontWeight: "500", textAlign: "center" }}>
          {isBlocked ? (
            "Bloqueado"
          ) : isBookedByUser ? (
            "Tu reserva"
          ) : isFull ? (
            "Completo"
          ) : (
            <span style={{ color: "#9CAF88" }}>
              {availableSpots} {availableSpots === 1 ? "plaza" : "plazas"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}