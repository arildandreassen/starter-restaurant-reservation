import { useEffect, useState } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { listTables, seatTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const location = useLocation();
  const [tableSelection, setTableSelection] = useState(null);
  const [tables, setTables] = useState([]);
  const { reservation_id } = useParams();
  const history = useHistory();
  const [validationError, setValidationError] = useState(null);

  useEffect(loadSeatReservations, [location.state]);

  function loadSeatReservations() {
    const abortController = new AbortController();

    listTables(abortController.signal)
      .then(setTables)
      .catch(setValidationError);
    return () => abortController.abort();
  }

  function handleSelect(event) {
    setTableSelection(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    const table = tables.find((table) => table.table_name === tableSelection);
    if (table) {
      seatTable(reservation_id, table.table_id, abortController.signal).then(
        async (response) => {
          if (response.status === 400) {
            const json = await response.json();
            if (json.error) {
              setValidationError({ message: json.error });
            }
          } else {
            history.push("/dashboard");
          }
        }
      );
    } else {
      setValidationError({ message: "Invalid Table Selection" });
    }
    return () => abortController.abort();
  }

  function handleCancel() {
    history.goBack();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select name="table_id" onChange={handleSelect}>
          <option value=""></option>
          {tables &&
            tables.map((table) => {
              return (
                <option key={table.table_id} value={table.table_name}>
                  {table.table_name + " - " + table.capacity}
                </option>
              );
            })}
        </select>
        <button onClick={handleCancel}>Cancel</button>
        <button href={`/reservations/${reservation_id}/seat`} type="submit">
          Submit
        </button>
      </form>
      {validationError && <ErrorAlert error={validationError} />}
    </div>
  );
}

export default SeatReservation;
