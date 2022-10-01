import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getReservation, updateReservation } from "../utils/api";
import "./NewReservations.css";
import ReservationForm from "./ReservationForm";

function EditReservation() {
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
      response = await updateReservation(formData, abortController.signal);
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

export default EditReservation;
