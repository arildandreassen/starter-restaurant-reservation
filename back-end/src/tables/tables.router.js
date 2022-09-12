/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./tables.controller");

router.route("/").get(controller.list).post(controller.post);
router
  .route("/:table_id/seat")
  .put(controller.seatTable)
  .delete(controller.finishTable);

module.exports = router;
