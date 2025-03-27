const catchAsync = require("../utils/catchAsync");
const Comment = require("../model/commentModel");
const AppError = require("../utils/appError");

exports.createComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const maxComment = 3;
  const commentCount = await Comment.countDocuments({ author: req.user._id });
  if (commentCount >= maxComment) {
    return next(
      new AppError(`You can only post maximum of ${maxComment} comments `, 403)
    );
  }

  const newComment = await Comment.create({
    content: content,
    author: req.user._id,
  });

  res.status(200).json({
    status: "success",
    message: "New comment added",
    data: {
      comment: newComment,
    },
  });
});

exports.getAllUserComments = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const comments = await Comment.find({ author: userId });
  if (!comments) {
    res.status(404).json({
      status: "fail",
      message: "Comments non found",
    });
  }

  res.status(200).json({
    status: "success",
    data: comments,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      status: "fail",
      message: "Comment not found",
    });
  }

  if (comment.author.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to update this comment",
    });
  }

  if (content) {
    comment.content = content;
  }

  await comment.save();

  res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      status: "fail",
      message: "Comment not found",
    });
  }

  if (comment.author.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to delete this comment",
    });
  }

  await Comment.deleteOne({ _id: commentId });

  res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find().populate("author", "name role avatar");

  if (!comments) {
    res.status(404).json({
      status: "fail",
      message: "coment not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: comments,
  });
});
