const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const requiredKeys = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    data = await service.listByDate(date);
  } else if (mobile_number) {
    data = await service.searchByMobile(mobile_number);
  } else {
    data = await service.list();
  }
  res.status(200).json({
    data,
  });
}

async function get(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

async function create(req, res) {
  const { body } = req;
  if (!body.data.status) {
    body.data.status = "booked";
  }
  const data = await service.create(body.data);
  res.status(201).json({
    data: data[0],
  });
}

async function update(req, res) {
  const { reservation, reservation_id } = res.locals;
  reservation.reservation_id = reservation_id;
  const data = await service.update(reservation);
  res.status(200).json({
    data,
  });
}

async function updateStatus(req, res) {
  const { reservation_id, status } = res.locals;
  const result = await service.updateStatus(reservation_id, status);
  if (result) {
    res.json({ data: result });
  } else {
    res.json("there was a problem with the update");
  }
}

async function verifyGet(req, res, next) {
  const { reservation_id } = req.params;
  const result = await service.get(reservation_id);
  if (result) {
    res.locals.reservation = result;
    res.locals.reservation_id = reservation_id;
    return next();
  } else {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} not found`,
    });
  }
}

async function verifyCreate(req, res, next) {
  const { body } = req;
  if (!body.data) {
    return next({
      status: 400,
      message: "The body is missing the data object",
    });
  }

  // compare the body against the required keys
  const validationErrors = validate(body.data);
  if (validationErrors.length) {
    return next({
      status: 400,
      message: `The following fields had invalid values or where missing: ${validationErrors}`,
    });
  }

  const { reservation_date, reservation_time } = body.data;
  const now = new Date();

  const concatTime = new Date(
    `${reservation_date}T${reservation_time}:00.000Z`
  );
  const day = concatTime.getDay();

  if (concatTime < now) {
    return next({
      status: 400,
      message: "the reservation needs to be in the future",
    });
  }

  if (isClosed(day)) {
    return next({
      status: 400,
      message: "the reservation cannot be when the restaurant is closed",
    });
  }

  const first_reservation = "10:30";
  const last_reservation = "21:30";

  if (
    reservation_time >= last_reservation ||
    reservation_time <= first_reservation
  ) {
    return next({
      status: 400,
      message: "the reservation cannot be outside of business hours",
    });
  }
  res.locals.reservation = body.data;
  next();
}

async function verifyUpdateStatus(req, res, next) {
  const { reservation, reservation_id } = res.locals;
  const { status } = req.body.data;

  if (!["booked", "finished", "seated", "cancelled"].includes(status)) {
    return next({
      status: 400,
      message: `the status ${status} is not valid`,
    });
  }

  if (!reservation) {
    return next({
      status: 404,
      message: `the reservation_id: ${reservation_id} does not exist`,
    });
  }

  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: `the reservation has already been finished`,
    });
  }

  res.locals.status = status;
  next();
}

function validate(reservation) {
  const invalidTypes = [];
  const invalidValues = [];
  const requestkeys = Object.keys(reservation);
  // Verify that none of the required fields are missing
  const missingFields = requiredKeys.filter(
    (key) => !requestkeys.includes(key)
  );

  // Verify that none of the fields are empty
  const emptyFields = requestkeys.filter((key) => !reservation[key]);

  // If [People] is not a number, then we should also error out

  if (reservation.people && typeof reservation.people !== "number") {
    invalidTypes.push("people");
  }

  // If [Reservation_date] is not a date, then error
  if (
    reservation.reservation_date &&
    !isValidDate(reservation.reservation_date)
  ) {
    invalidTypes.push("reservation_date");
  }

  // If [Reservation_time] is not a time, then error
  if (
    reservation.reservation_time &&
    !isValidTime(reservation.reservation_time)
  ) {
    invalidTypes.push("reservation_time");
  }

  if (reservation.status && reservation.status !== "booked") {
    invalidValues.push(`status: ${reservation.status}`);
  }

  return [...missingFields, ...emptyFields, ...invalidTypes, ...invalidValues];
}

function isValidDate(string) {
  const validDate = new Date(string);
  return validDate > 0;
}

function isValidTime(string) {
  const regexp = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
  const validtime = regexp.test(string);
  return validtime;
}

function isClosed(day) {
  /* 
    0 = sunday
    1 = monday
    2 = tuesday
    3 = wednesday
    4 = thursday
    5 = friday
    6 = saturday
  */
  return [2].includes(day);
}

module.exports = {
  list: asyncErrorBoundary(list),
  get: [verifyGet, get],
  post: [verifyCreate, asyncErrorBoundary(create)],
  update: [verifyGet, verifyCreate, asyncErrorBoundary(update)],
  updateStatus: [
    verifyGet,
    verifyUpdateStatus,
    asyncErrorBoundary(updateStatus),
  ],
};
