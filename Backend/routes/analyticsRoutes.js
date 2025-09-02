const express = require("express");
const {
  getDashboardStats,
  getAttendeeDemographics,
} = require("../controllers/analyticsController");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", auth, adminAuth, getDashboardStats);
router.get("/demographics", auth, adminAuth, getAttendeeDemographics);

module.exports = router;
