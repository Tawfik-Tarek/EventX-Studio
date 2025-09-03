const express = require("express");
const {
  getDashboardStats,
  getAttendeeDemographics,
  getPerEventStats,
  getRevenueOverTime,
  exportPerEventCSV,
} = require("../controllers/analyticsController");
const { auth, adminAuth } = require("../middleware/auth");
const Joi = require("joi");

// Lightweight inline validation for revenue endpoint
const revenueQueryValidator = (req, res, next) => {
  const schema = Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
    granularity: Joi.string().valid("day", "month").default("day"),
  });
  const { error, value } = schema.validate(req.query, { abortEarly: false });
  if (error)
    return res
      .status(400)
      .json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
  req.query = value;
  next();
};

const router = express.Router();

router.get("/dashboard", auth, adminAuth, getDashboardStats);
router.get("/demographics", auth, adminAuth, getAttendeeDemographics);
router.get("/per-event", auth, adminAuth, getPerEventStats);
router.get(
  "/revenue",
  auth,
  adminAuth,
  revenueQueryValidator,
  getRevenueOverTime
);
router.get("/export/per-event.csv", auth, adminAuth, exportPerEventCSV);

module.exports = router;
