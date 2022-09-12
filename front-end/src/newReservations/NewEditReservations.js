import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  createReservation,
  getReservation,
  updateReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import "./NewReservations.css";

function NewReservations() {
  const defaultForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
    status: "booked",
  };

  const history = useHistory();
  const [formData, setFormData] = useState(defaultForm);
  const [validationError, setValidationError] = useState(null);
  const { reservation_id } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    if (reservation_id) {
      getReservation(reservation_id, abortController.signal).then(
        (reservation) => setFormData(reservation)
      );
    }
    return () => abortController.abort();
  }, [reservation_id]);

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "people") {
      value = Number(value);
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    const abortController = new AbortController();
    event.preventDefault();
    let response;
    try {
      if (!reservation_id) {
        response = await createReservation(formData, abortController.signal);
      } else {
        response = await updateReservation(formData, abortController.signal);
      }
    } catch (e) {
      setValidationError({ message: e });
    }

    if (response.status === 400) {
      const json = await response.json();
      if (json.error) {
        setValidationError({ message: json.error });
      }
    } else {
      history.push(`/dashboard?date=${formData.reservation_date}`);
    }

    return () => abortController.abort();
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          type="text"
          autoComplete="none"
          onChange={handleChange}
          value={formData.first_name}
          placeholder="first name"
        />
        <input
          name="last_name"
          type="text"
          autoComplete="none"
          onChange={handleChange}
          value={formData.last_name}
          placeholder="last name"
        />
        <input
          name="mobile_number"
          type="text"
          autoComplete="none"
          onChange={handleChange}
          value={formData.mobile_number}
          placeholder="phone number"
        />
        <input
          name="reservation_date"
          type="date"
          autoComplete="none"
          placeholder="YYYY-MM-DD"
          pattern="\d{4}-\d{2}-\d{2}"
          onChange={handleChange}
          value={formData.reservation_date}
        />
        <input
          name="reservation_time"
          type="time"
          autoComplete="none"
          placeholder="HH:MM"
          pattern="[0-9]{2}:[0-9]{2}"
          onChange={handleChange}
          value={formData.reservation_time}
        />
        <input
          name="people"
          autoComplete="none"
          onChange={handleChange}
          value={formData.people}
        />
        <button onClick={handleCancel}>Cancel</button>
        <button type="submit">Submit</button>
      </form>
      {validationError && <ErrorAlert error={validationError} />}
    </main>
  );
}

export default NewReservations;
