const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");

/**
 * GET /api/appointments
 * List all appointments of the owner's business
 */
async function listMyAppointments(req, res) {
  const userId = req.user.sub;
  const user = await User.findById(userId);

  if (!user || !user.businessId) {
    return res.status(403).json({ message: "No business linked" });
  }

  const appointments = await Appointment.find({
    businessId: user.businessId,
  })
    .populate("serviceId", "name durationMin price")
    .sort({ startAt: 1 });

  return res.json({
    appointments: appointments.map((a) => ({
      id: a._id,
      serviceName: a.serviceId?.name || null,
      durationMin: a.serviceId?.durationMin || null,
      price: a.serviceId?.price || null,
      customerName: a.customerName,
      customerPhone: a.customerPhone,
      startAt: a.startAt,
      status: a.status,
      notes: a.notes,
    })),
  });
}

/**
 * GET /api/appointments/availability?date=YYYY-MM-DD
 * Returns available hours for the selected date
 */
async function getAvailability(req, res) {
  const userId = req.user.sub;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Missing date" });
  }

  const user = await User.findById(userId);
  if (!user || !user.businessId) {
    return res.status(400).json({ message: "No business linked" });
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const appointments = await Appointment.find({
    businessId: user.businessId,
    startAt: { $gte: dayStart, $lte: dayEnd },
  });

  const takenHours = appointments.map(
    (a) => new Date(a.startAt).getHours()
  );

  const workingHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  const availability = workingHours.map((hour) => ({
    hour,
    available: !takenHours.includes(hour),
  }));

  return res.json({ availability });
}

/**
 * POST /api/appointments
 * Create a new appointment (OWNER only)
 */
async function createAppointment(req, res) {
  const user = await User.findById(req.user.sub);

  if (!user || !user.businessId) {
    return res.status(403).json({ message: "No business linked" });
  }

  const { serviceId, startAt, customerName, customerPhone, notes } = req.body;

  if (!serviceId || !startAt) {
    return res
      .status(400)
      .json({ message: "serviceId and startAt are required" });
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  try {
    const appointment = await Appointment.create({
      businessId: user.businessId,
      serviceId,
      startAt: new Date(startAt),
      customerName,
      customerPhone,
      notes,
    });

    return res.status(201).json({ appointmentId: appointment._id });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Time slot already booked" });
    }
    throw err;
  }
}

async function deleteAppointment(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user || !user.businessId) {
    return res.status(403).json({ message: "No business linked" });
  }

  const { id } = req.params;

  const appointment = await Appointment.findOne({
    _id: id,
    businessId: user.businessId,
  });

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  await appointment.deleteOne();

  return res.json({ message: "Appointment deleted" });
}




module.exports = {
  listMyAppointments,
  getAvailability,
  createAppointment,
  deleteAppointment,
};
