import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTables() {
  let form = {
    table_name: "",
    capacity: null,
  };
  const history = useHistory();
  const [formData, setFormData] = useState(form);
  const [validationError, setValidationError] = useState(null);

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "capacity") {
      value = Number(value);
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await createTable({
      table_name: formData.table_name,
      capacity: formData.capacity,
    });

    if (response.status === 400) {
      const json = await response.json();
      if (json.error) {
        setValidationError({ message: json.error });
      }
    } else {
      history.push("/dashboard");
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="table_name"
          placeholder="table name"
          onChange={handleChange}
          value={formData.table_name}
        />
        <input
          name="capacity"
          placeholder="capacity"
          onChange={handleChange}
          value={formData.capacity || ""}
        />
        <button onClick={handleCancel}>Cancel</button>
        <button type="submit">Submit</button>
      </form>
      {validationError && <ErrorAlert error={validationError} />}
    </div>
  );
}

export default NewTables;
