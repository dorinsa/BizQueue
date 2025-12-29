const router = require("express").Router();
const { auth, requireRole } = require("../middlewares/auth");
const {
  listMyAppointments,
  getAvailability,
  createAppointment,
  deleteAppointment,
} = require("../controllers/appointments.controller");

router.get("/", auth, requireRole("OWNER"), listMyAppointments);
router.get("/availability", auth, requireRole("OWNER"), getAvailability);
router.post("/", auth, requireRole("OWNER"), createAppointment);
router.delete("/:id", auth, requireRole("OWNER"), deleteAppointment);

module.exports = router;
