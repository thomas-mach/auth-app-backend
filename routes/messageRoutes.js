const express = require("express");
const messageContrroller = require("../controllers/messageController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.protect, messageContrroller.getMessages);

module.exports = router;
