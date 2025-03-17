const express = require("express");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const morgan = require("morgan");
const globalErrorHandling = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

require("./jobs/deleteOldUsers");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(
  "/avatars",
  express.static(path.join(__dirname, "public/avatars"), {
    maxAge: "1d",
    etag: true,
    setHeaders: (res, path) => {
      res.setHeader("Cache-Control", "public, max-age=86400"); // Imposta correttamente la cache
    },
  })
);

app.use(helmet());
//contro atacchi basati sul headers Cross-Site Scripting (XSS)
// Clickjacking
// Attacchi di sniffing MIME
// Injection di codice
// Altri attacchi basati sugli header HTTP

// app.get("/test-avatar", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/avatars/avatar_1.png"));
// });

app.set("trust proxy", 1);

app.use("/v1/auth", authRouter);
app.use("/v1/users", userRouter);

app.use(globalErrorHandling);

module.exports = app;
