import dotenv from "dotenv";
import app from "./app.js";
import dbconnect from "./db/dbconnect.js";

const PORT = process.env.PORT || 8000;

dbconnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
