const catchAsync = require("../utils/catchAsync");
const Comment = require("../model/commentModel");

exports.comment = catchAsync(async (req, res, next) => {
  const { comment } = req.body;
  const userId = req.user.id; // Supponiamo che l'utente sia autenticato e il suo ID sia nel JWT
  console.log("Body ricevuto:", req.body);
  if (!comment) {
    return res.status(400).json({
      status: "fail",
      message: "Comment cannot be empty.",
    });
  }

  const newComment = await Comment.create({ comment, user: userId });

  return res.status(201).json({
    status: "success",
    message: "Comment added.",
    data: newComment,
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find().populate({
    path: "user",
    select: "name avatar",
  });

  if (!comments) {
    next(new AppError("Comments not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: comments.length,
    data: {
      comments,
    },
  });
});
