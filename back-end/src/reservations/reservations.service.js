const knex = require("../db/connection");
const table = "reservations";

const list = () => {
  return knex(table).select("*");
};
const get = (id) => {
  return knex(table).select("*").where("reservation_id", Number(id)).first();
};

const listByDate = (date) => {
  return knex(table)
    .select("*")
    .where("reservation_date", date)
    .whereNot("status", "finished")
    .orderBy("reservation_time", "asc");
};

const create = (reservation) => {
  return knex(table)
    .insert(reservation)
    .returning([
      "reservation_id",
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people",
      "status",
    ]);
};

const update = ({
  reservation_id,
  first_name,
  last_name,
  mobile_number,
  reservation_date,
  reservation_time,
  people,
}) => {
  return knex("reservations")
    .update({
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
    })
    .where({ reservation_id })
    .returning([
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people",
      "status",
    ])
    .then((rows) => rows[0]);
};

const updateStatus = (reservation_id, status) => {
  return knex("reservations")
    .update({ status })
    .where({ reservation_id })
    .returning([
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people",
      "status",
    ])
    .then((rows) => rows[0]);
};

const searchByMobile = (mobile_number) => {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
};

module.exports = {
  list,
  get,
  create,
  listByDate,
  update,
  updateStatus,
  searchByMobile,
};
