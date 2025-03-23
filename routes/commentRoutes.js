const express = require("express");
const commentContrroller = require("../controllers/commentController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .post("/comment", authController.protect, commentContrroller.createComment)
  .get(
    "/comment",
    authController.protect,
    commentContrroller.getAllUserComments
  )
  .get("/", commentContrroller.getAllComments)
  .patch(
    "/comment/:commentId",
    authController.protect,
    commentContrroller.updateComment
  )
  .delete(
    "/comment/:commentId",
    authController.protect,
    commentContrroller.deleteComment
  );

module.exports = router;
