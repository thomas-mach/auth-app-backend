const { stat } = require("fs");
const User = require("../model/userModel");
const Comment = require("../model/commentModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    next(new AppError("No users found!", 404));
  }

  res.status(200).json({
    status: "succes",
    data: users,
  });
});

exports.getUserComments = catchAsync(async (req, res, next) => {
  const myComments = await Comment.find({ user: req.user.id });

  if (!myComments) {
    next(new AppError("There is no comments", 404));
  }

  res.status(200).json({
    status: "succes",
    results: myComments.length,
    data: myComments,
  });
});

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id, //viene preso dal middleware di autenticazione
    { isActive: false, isVerified: false, deactivatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    next(new AppError("Utente non trovato", 404));
  }

  // Disconnetti l'utente cancellando il cookie JWT
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Your account has been successfully deactivated!",
  });
});
