import { useHistory } from "react-router";
import "./Reservation.css";

function Reservation({
  reservation: { reservation_id, first_name, last_name, people, status },
  handleCancel,
}) {
  const history = useHistory();
  const handleSeat = (event) => {
    const reservation_id = event.target.attributes.reservation_id.value;
    history.push({
      pathname: `/reservations/${reservation_id}/seat`,
      state: { people, reservation_id, status },
    });
  };

  const handleEdit = (event) => {
    const reservation_id = event.target.attributes.reservation_id.value;
    history.push(`/reservations/${reservation_id}/edit`);
  };

  return (
    <div className="reservation container-fluid">
      <div className="reservation-item">
        First name:
        <span> {first_name}</span>
      </div>
      <div className="reservation-item">
        Last name:
        <span> {last_name}</span>
      </div>
      <div
        data-reservation-id-status={reservation_id}
        className={`reservation-item`}
      >
        <div className={`status ${status}`}>{status}</div>
      </div>
      <div className="reservation-buttons">
        <div className="reservation-button-item">
          {status === "booked" && (
            <button
              reservation_id={reservation_id}
              href={`/reservations/${reservation_id}/seat`}
              onClick={handleSeat}
            >
              Seat
            </button>
          )}
        </div>
        <div className="reservation-button-item">
          <button
            reservation_id={reservation_id}
            href={`/reservations/${reservation_id}/edit`}
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
        <div className="reservation-button-item">
          {status !== "cancelled" && status !== "finished" && (
            <button
              reservation_id={reservation_id}
              data-reservation-id-cancel={reservation_id}
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reservation;
