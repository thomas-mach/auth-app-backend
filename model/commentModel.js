const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      minlength: [5, "Comment must have at least 1 character"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true }
);

// commentSchema.pre(/^find/, function (next) {
//   this.populate({ path: "user", select: "name + avatar" });
//   next();
// });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
