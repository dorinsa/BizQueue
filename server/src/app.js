const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const { auth } = require("./middlewares/auth");
const businessRoutes = require("./routes/business.routes");
const servicesRoutes = require("./routes/services.routes");



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "BizQueue API", time: new Date().toISOString() });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ ok: true, user: req.user });
});


app.use("/api/auth", authRoutes);

app.use("/api/business", businessRoutes);

app.use("/api/services", servicesRoutes);




module.exports = { app };
