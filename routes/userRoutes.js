const express = require("express");
const userContrroller = require("../controllers/userController");
const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

const router = express.Router();

// router.get("/", userContrroller.getAllUsers);

router.patch(
  "/deleteMe",
  authController.protect,
  userContrroller.softDeleteUser
);

// router.post("/comment", authController.protect, commentController.writeComment);

module.exports = router;
