import Table from "./Table";
import "./Tables.css";

function Tables({ handleFinish, tables }) {
  return (
    <div className="tables">
      <div>TABLES</div>
      {tables.map((table) => {
        return (
          <Table
            key={table.table_id}
            table={table}
            handleFinish={handleFinish}
          />
        );
      })}
    </div>
  );
}

export default Tables;
