const express = require("express");
const authController = require("../controllers/authController");
const commentContrroller = require("../controllers/commentController");

const router = express.Router();

// const authLimiter = limiter({
//   windowsMs: 5 * 60 * 1000,
//   max: process.env.NODE_ENV === "production" ? 5 : 100,
//   headers: true,
//   handler: (req, res) => {
//     res.status(429).json({
//       status: "failed",
//       message: "Too many attempts! Please try again in a few minutes.",
//     });
//   },
// });

router.get("/", commentContrroller.getAllComments);
router.post("/comment", authController.protect, commentContrroller.comment);

module.exports = router;
