const Business = require("../models/Business");
const User = require("../models/User");

async function createBusiness(req, res) {
  const userId = req.user.sub;

  const { name, category, phone, address } = req.body || {};
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Business name is required" });
  }

  // לא לאפשר ליצור יותר מעסק אחד ל-OWNER בשלב הזה (MVP)
  const existing = await User.findById(userId);
  if (!existing) return res.status(404).json({ message: "User not found" });
  if (existing.businessId) {
    return res.status(409).json({ message: "Owner already has a business" });
  }

  const business = await Business.create({
    name: name.trim(),
    category: category?.trim() || "General",
    phone: phone?.trim() || "",
    address: address?.trim() || "",
    ownerId: userId,
  });

  existing.businessId = business._id;
  await existing.save();

  return res.status(201).json({
    business: {
      id: business._id,
      name: business.name,
      category: business.category,
      phone: business.phone,
      address: business.address,
    },
  });
}

async function getMyBusiness(req, res) {
  const businessId = req.user.businessId;
  if (!businessId) return res.status(404).json({ message: "No business linked to this user" });

  const business = await Business.findById(businessId);
  if (!business) return res.status(404).json({ message: "Business not found" });

  return res.json({
    business: {
      id: business._id,
      name: business.name,
      category: business.category,
      phone: business.phone,
      address: business.address,
    },
  });
}

module.exports = { createBusiness, getMyBusiness };
