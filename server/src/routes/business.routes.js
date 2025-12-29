const router = require("express").Router();
const { auth, requireRole } = require("../middlewares/auth");
const { createBusiness, getMyBusiness } = require("../controllers/business.controller");

router.post("/", auth, requireRole("OWNER"), createBusiness);
router.get("/me", auth, getMyBusiness);

module.exports = router;
