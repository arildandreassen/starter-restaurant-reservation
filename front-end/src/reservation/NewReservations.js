import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import "./NewReservations.css";
import ReservationForm from "./ReservationForm";

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

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "people") {
      value = Number(value);
    }

    if (name === "mobile_number") {
      const char = value[value.length - 1];
      if (char && isNaN(parseInt(char))) return;
      if (value.length > 9) return;
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
      response = await createReservation(formData, abortController.signal);
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

  return (
    <ReservationForm
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      validationError={validationError}
      formData={formData}
    />
  );
}

export default NewReservations;
