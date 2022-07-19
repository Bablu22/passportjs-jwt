const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/passportJWT")
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
