const router = require("express").Router();
const { auth, requireRole } = require("../middlewares/auth");
const { createService, listMyServices } = require("../controllers/services.controller");

router.get("/", auth, requireRole("OWNER"), listMyServices);
router.post("/", auth, requireRole("OWNER"), createService);

module.exports = router;
