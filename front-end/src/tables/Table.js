import "./Table.css";

function Table({ table, handleFinish }) {
  const isOccupied = table.reservation_id ? true : false;
  const { table_name, capacity } = table;
  return (
    <div className="table">
      <div className="table-item">{table_name}</div>
      <div className="table-item">{capacity}</div>
      <div data-table-id-status={table.table_id} className="table-item">
        {isOccupied ? "Occupied" : "Free"}
      </div>
      {isOccupied && (
        <button
          className="table-item"
          data-table-id-finish={table.table_id}
          onClick={handleFinish}
          table_id={table.table_id}
        >
          Finish
        </button>
      )}
    </div>
  );
}

export default Table;
