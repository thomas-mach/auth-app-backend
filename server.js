const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");

const PORT = process.env.PORT || 3003;

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log("Database connected...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
