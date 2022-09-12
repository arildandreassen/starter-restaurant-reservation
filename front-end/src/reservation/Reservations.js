import Reservation from "./Reservation";

function Reservations({ handleCancel, reservations }) {
  return (
    <div>
      {reservations.map((reservation) => {
        return (
          <Reservation
            key={reservation.reservation_id}
            reservation={reservation}
            handleCancel={handleCancel}
          />
        );
      })}
    </div>
  );
}

export default Reservations;
