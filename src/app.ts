import "./utils/config-env";
import express from "express";

import { connectDB } from "./utils/db";
import "./model/user.model";
import "./model/todo.model";
import "./model/notification.model";
import userRouter from "./routes/user.routes";
import todoRouter from "./routes/todo.routes";
import notificationRouter from "./routes/notification.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/todos", todoRouter);
app.use("/api/notifications", notificationRouter);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to connect to the database. Server not started.",
      error
    );
    process.exit(1);
  }
};

startServer();
