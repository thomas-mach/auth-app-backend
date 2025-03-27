const catchAsync = require("../utils/catchAsync");
const Message = require("../model/messageModel");
const AppError = require("../utils/appError");

exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find().populate("sender", "name avatar");

  if (!messages) {
    return next(new AppError("No message found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});
