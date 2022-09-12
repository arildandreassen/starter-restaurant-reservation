const knex = require("../db/connection");
const table = "tables";

const list = () => {
  return knex(table).select("*");
};

const get = (id) => {
  return knex(table).select("*").where("table_id", Number(id)).first();
};

const create = (tableDetails) => {
  return knex(table)
    .insert(tableDetails)
    .returning(["table_id", "table_name", "capacity"]);
};

const seatTable = (reservation_id, table_id) => {
  return knex.transaction(async (trx) => {
    return trx
      .update({ status: "occupied", reservation_id })
      .into(table)
      .where({ table_id })
      .then(() => {
        return trx
          .update({ status: "seated" })
          .into("reservations")
          .where({ reservation_id });
      });
  });
};

const finishTable = (table_id) => {
  return knex.transaction(async (trx) => {
    return trx
      .select("*")
      .from(table)
      .where({ table_id })
      .first()
      .then(async (tbl) => {
        return trx
          .update({ status: "finished", reservation_id: null })
          .into(table)
          .where({ table_id })
          .then(async () => {
            return trx
              .update({ status: "finished" })
              .where({ reservation_id: tbl.reservation_id })
              .into("reservations");
          });
      });
  });
};

module.exports = {
  create,
  list,
  get,
  seatTable,
  finishTable,
};
