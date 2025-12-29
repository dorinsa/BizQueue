const Service = require("../models/Service");
const User = require("../models/User");

async function createService(req, res) {
  const userId = req.user.sub;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.businessId) return res.status(400).json({ message: "No business linked to this user" });

  const { name, durationMin, price } = req.body || {};

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Service name is required" });
  }

  const dur = Number(durationMin);
  const pr = Number(price);

  if (!Number.isFinite(dur) || dur < 5) {
    return res.status(400).json({ message: "durationMin must be >= 5" });
  }
  if (!Number.isFinite(pr) || pr < 0) {
    return res.status(400).json({ message: "price must be >= 0" });
  }

  const service = await Service.create({
    businessId: user.businessId,
    name: name.trim(),
    durationMin: dur,
    price: pr,
  });

  return res.status(201).json({
    service: {
      id: service._id,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price,
    },
  });
}

async function listMyServices(req, res) {
  const userId = req.user.sub;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.businessId) return res.status(400).json({ message: "No business linked to this user" });

  const services = await Service.find({ businessId: user.businessId }).sort({ createdAt: -1 });

  return res.json({
    services: services.map((s) => ({
      id: s._id,
      name: s.name,
      durationMin: s.durationMin,
      price: s.price,
    })),
  });
}

module.exports = { createService, listMyServices };
