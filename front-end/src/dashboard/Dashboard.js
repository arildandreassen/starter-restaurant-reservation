import React, { useEffect, useState } from "react";
import {
  listReservations,
  finishTable,
  listTables,
  updateReservationStatus,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from "react-router-dom";
import Reservations from "../reservation/Reservations";
import Tables from "../tables/Tables";
import dayjs from "dayjs";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const location = useLocation();
  const [displayDate, setDisplayDate] = useState("");
  const history = useHistory();

  useEffect(loadDashboard, [date, location]);

  function loadDashboard() {
    const query = new URLSearchParams(location.search);
    const queryDate = query.get("date") || date;
    setDisplayDate(queryDate);
    const abortController = new AbortController();

    setReservationsError(null);
    listReservations({ date: queryDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables);
    return () => abortController.abort();
  }

  const handleFinish = (event) => {
    const abortController = new AbortController();
    const table_id = event.target.attributes.table_id.value;
    if (window.confirm("Is this table ready to seat new guests?")) {
      finishTable(table_id, abortController.signal).then(loadDashboard);
    }
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
      updateReservationStatus(
        reservation_id,
        "cancelled",
        abortController.signal
      )
        .then(loadDashboard)
        .catch(setReservationsError);
    }
    return () => abortController.abort();
  };

  const handlePrevious = () => {
    const previous = dayjs(displayDate).subtract(1, "day").format("YYYY-MM-DD");
    history.push(`?date=${previous}`);
  };

  const handleToday = () => {
    history.push("/");
  };

  const handleNext = () => {
    const next = dayjs(displayDate).add(1, "day").format("YYYY-MM-DD");
    history.push(`?date=${next}`);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <button onClick={handlePrevious}>Previous</button>
      <button onClick={handleToday}>Today</button>
      <button onClick={handleNext}>Next</button>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">{`Reservations for date ${displayDate}`}</h4>
      </div>
      <ErrorAlert error={reservationsError} />

      <Reservations reservations={reservations} handleCancel={handleCancel} />
      <Tables tables={tables} handleFinish={handleFinish} />
    </main>
  );
}

export default Dashboard;
