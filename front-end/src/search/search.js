import { useState } from "react";
import { searchByMobileNumber, updateReservationStatus } from "../utils/api";
import Reservations from "../reservation/Reservations";
import ErrorAlert from "../layout/ErrorAlert";
import "./Search.css";

function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleChange = (event) => {
    const { value } = event.target;
    const char = value[value.length - 1];
    if (char && isNaN(parseInt(char))) return;
    if (value.length > 9) return;
    setMobileNumber(value);
  };

  const handleSubmit = async (event) => {
    const abortController = new AbortController();
    event.preventDefault();
    setSearched(false);
    const result = await searchByMobileNumber(
      mobileNumber,
      abortController.signal
    );
    setReservations(result);
    setSearched(true);
    return () => abortController.abort();
  };

  const handleCancel = async (event) => {
    const abortController = new AbortController();
    const reservation_id = event.target.attributes.reservation_id.value;
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone"
      )
    ) {
      updateReservationStatus(reservation_id, "cancelled")
        .then(async () => {
          const result = await searchByMobileNumber(
            mobileNumber,
            abortController.signal
          );
          setReservations(result);
        })
        .catch(setValidationError);
    }
    return () => abortController.abort();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <input
          name="mobile_number"
          placeholder={"Enter a customer's phone number"}
          onChange={handleChange}
          value={mobileNumber}
          autoComplete="off"
        />
        <button type="submit">Find</button>
      </form>
      <Reservations reservations={reservations} handleCancel={handleCancel} />
      {searched && reservations.length === 0 && (
        <div>No reservations found</div>
      )}
      {validationError && <ErrorAlert error={validationError} />}
    </div>
  );
}

export default Search;
