const service = require("./tables.service");
const reservation_service = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const list = await service.list();
  res.json({ data: list.sort(sortByTableName) });
}

async function create(req, res) {
  const { body } = res.locals;
  const data = await service.create(body.data);
  res.status(201).json({
    data: data[0],
  });
}

async function seatTable(req, res) {
  const { reservation, table } = res.locals;
  const data = await service.seatTable(
    reservation.reservation_id,
    table.table_id
  );
  res.json({ data });
}

async function finishTable(req, res) {
  const { table } = res.locals;
  const result = await service.finishTable(table.table_id);
  res.json({ data: result });
}

async function verifyCreateBody(req, res, next) {
  const { body } = req;
  if (!body.data) {
    return next({
      status: 400,
      message: "The body is missing the data object",
    });
  }
  const { data } = body;
  if (!data.table_name || data.table_name.length <= 1) {
    return next({
      status: 400,
      message: "The table_name is missing or has malformed data",
    });
  }

  if (
    !data.capacity ||
    data.capacity === 0 ||
    typeof data.capacity !== "number"
  ) {
    return next({
      status: 400,
      message: "The capacity is missing or has malformed data",
    });
  }
  res.locals.body = body;
  next();
}

async function verifySeatBody(req, res, next) {
  const { body } = req;
  const { table } = res.locals;
  if (!body.data) {
    return next({
      status: 400,
      message: "The body is missing the data object",
    });
  }

  const reservationRequest = body.data;
  if (!reservationRequest.reservation_id) {
    return next({
      status: 400,
      message: "The reservation_id is missing or has malformed data",
    });
  }

  const existingReservation = await reservation_service.get(
    reservationRequest.reservation_id
  );
  if (!existingReservation) {
    return next({
      status: 404,
      message: `The reservation_id ${reservationRequest.reservation_id} does not exist`,
    });
  }

  if (existingReservation.status === "seated") {
    return next({
      status: 400,
      message: `The reservation_id ${reservationRequest.reservation_id} has already been seated`,
    });
  }

  if (table && table.capacity < existingReservation.people) {
    return next({
      status: 400,
      message: "the table does not have capacity to seat this reservation",
    });
  }

  res.locals.reservation = reservationRequest;
  res.locals.table = table;
  next();
}

const verifyTableExist = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.get(table_id);
  if (!table) {
    return next({
      status: 404,
      message: `table ${table_id} does not exist`,
    });
  }
  res.locals.table = table;
  next();
};

const verifyTableIsOccupied = async (req, res, next) => {
  const { table } = res.locals;
  if (!table.reservation_id) {
    return next({
      status: 400,
      message: `table ${table.table_id} is not occupied`,
    });
  }
  next();
};

const verifyTableIsAvailable = async (req, res, next) => {
  const { table } = res.locals;

  if (table.status && table.status === "occupied") {
    return next({
      status: 400,
      message: `table ${table.table_id} is occupied`,
    });
  }
  next();
};

function sortByTableName(a, b) {
  if (b.table_name > a.table_name) {
    return -1;
  } else if (b.table_name < a.table_name) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = {
  post: [verifyCreateBody, asyncErrorBoundary(create)],
  list,
  seatTable: [
    verifyTableExist,
    verifySeatBody,
    verifyTableIsAvailable,
    asyncErrorBoundary(seatTable),
  ],
  finishTable: [
    verifyTableExist,
    verifyTableIsOccupied,
    asyncErrorBoundary(finishTable),
  ],
};
