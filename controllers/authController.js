const crypto = require("crypto");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const { promisify } = require("util");
const ms = require("ms");
const emailMessage = require("../utils/emailMessages");

const signToken = (id, duration) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: duration,
  });

const createSendToken = (user, status, res, duration) => {
  const {
    name,
    email,
    role,
    isVerified,
    isActive,
    profileImage,
    lastLogin,
    createdAt,
    updatedAt,
  } = user;

  const token = signToken(user._id, duration);

  const cookieOptions = {
    expires: new Date(Date.now() + ms(duration)),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    user: {
      name,
      email,
      role,
      isVerified,
      isActive,
      profileImage,
      lastLogin,
      createdAt,
      updatedAt,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isActive && existingUser.lastLogin !== null) {
      existingUser.password = password;
      existingUser.passwordConfirm = passwordConfirm;
      existingUser.name = name;
      await existingUser.save({ validateBeforeSave: false });

      const verificationToken = signToken(existingUser._id, "1h");
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/v1/auth/verify?token=${verificationToken}`;

      await sendEmail({
        email: existingUser.email,
        subject: "Confirm the reactivation of your account.",
        html: emailMessage.messageExsistingUser(
          existingUser.name,
          verificationUrl
        ),
      });

      return res.status(200).json({
        status: "success",
        message:
          "Your account has been reactivated! Check your email to confirm.",
      });
    }

    // Se l'utente esiste ed è attivo, blocca la registrazione
    return next(new AppError("Email already in use!", 400));
  }

  // Crea utente con stato "non verificato"
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    isVerified: false,
  });

  // Genera un token di verifica
  const verificationToken = signToken(newUser._id, "1h");

  // Crea il link di verifica
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/v1/auth/verify?token=${verificationToken}`;

  // Invia l'email di conferma
  try {
    await sendEmail({
      email: newUser.email,
      subject: "Confirm the activation of your account.",
      html: emailMessage.messageNewUser(newUser.name, verificationUrl),
    });

    res.status(200).json({
      status: "success",
      message:
        "Signup successful. Please check your email to verify your account.",
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError("There was an error sending emial try again later!"),
      500
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError("Missing token", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 400));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  if (user.isVerified) {
    return next(new AppError("Email already verified!", 400));
  }

  user.isVerified = true;
  user.isActive = true;
  user.deactivatedAt = null;

  await user.save({ validateBeforeSave: false });

  res.redirect(`${process.env.FRONTEND_URL}/auth-app-frontend/signin`);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password"), 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorect email or password", 401));
  }

  if (!user.isActive && !user.deactivatedAt) {
    return res.status(400).json({
      status: "failed",
      message: "Please verify yor email adress",
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    });
  }

  if (user.deactivatedAt) {
    return res.status(400).json({
      status: "failed",
      message: "Your account is deactivated. Please sign up again",
      email: user.email,
      name: user.name,
      deactivatedAt: user.deactivatedAt,
    });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 201, res, "7d");
});

// exports.logout = (req, res) => {
//   res
//     .status(200)
//     .cookie("jwt", "loggedout", {
//       expires: new Date(Date.now() + 10 * 1000),
//       httpOnly: true,
//     })
//     .json({ status: "success", message: "You are logged out" });
// };

exports.logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  });

  res.status(200).json({ status: "success", message: "You are logged out" });
};

exports.resendEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password"), 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorect email or password", 401));
  }

  if (!user.isVerified) {
    const verificationToken = signToken(user._id, "1h");
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/v1/auth/verify?token=${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Confirm the activation of your account.",
      html: emailMessage.messageNewUser(user.name, verificationUrl),
    });

    return res.status(200).json({
      status: "success",
      message: "Check your email to confirm.",
    });
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You must be logged in to access!", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(
      new AppError("The user does not exist or has been deactivated!", 401)
    );
  }

  // Chcek if user changed the password after the token was issued.
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("The password was recently changed please log in again", 401)
    );
  }

  req.user = user;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please enter your email adress", 404));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email adress", 404));
  }

  if (user.deactivatedAt) {
    try {
      await sendEmail({
        email: user.email,
        subject: `Info about your account`,
        html: emailMessage.messageDeactivatedUser(
          "https://thomas-mach.github.io/auth-app-frontend/signup"
        ),
      });

      return res.status(200).json({
        status: "success",
        message: "Please check your email.",
      });
    } catch (err) {
      return next(
        new AppError("There was an error sending emial try again later!"),
        500
      );
    }
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/v1/auth/resetPassword/${resetToken}`;

  const resetURL =
    process.env.NODE_ENV === "production"
      ? `${process.env.FRONTEND_URL}/auth-app-frontend/reset-password/?token=${resetToken}`
      : `http://localhost:5173/reset-password/?token=${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid 10 mins)`,
      html: emailMessage.messageResetPassword(resetURL),
    });

    res.status(200).json({
      status: "success",
      message: "Please check your email to reset your password.",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending emial try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is expired or invalid", 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res, "7d");
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  if (await user.correctPassword(req.body.passwordNew, user.password)) {
    return next(
      new AppError("Your new password must be different from the old one", 400)
    );
  }

  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res, "7d");
});
