const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "The name is required"],
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "The email is required"],
      unique: true,
      trim: true,
      maxlength: [255, "Email is too long"],
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "The password is required"],
      minlength: [8, "Password must be at least 8 characters."],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "The password is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },

        message: "The passwords are not the same",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.userCreatedAt = Date.now() - 1000;
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

userSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "user",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
