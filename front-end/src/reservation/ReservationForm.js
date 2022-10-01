import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";

function ReservationForm({
  formData,
  handleSubmit,
  handleChange,
  validationError,
}) {
  const history = useHistory();
  const handleCancel = () => {
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

export default ReservationForm;
