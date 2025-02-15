const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const { HttpCode } = require("./helpers/constants");
require("dotenv").config();

const usersRouter = require("./routes/api/usersRoute");
const contactsRouter = require("./routes/api/contactsRoute");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res, next) => {
  res.status(HttpCode.NOT_FOUND).json({
    status: "error",
    code: HttpCode.NOT_FOUND,
    message: `Use api on routes ${req.baseUrl}/api/contacts`,
    data: "Not found",
  });
});

app.use((err, req, res, next) => {
  err.status = err.status ? err.status : HttpCode.INTERNAL_SERVER_ERROR;
  res.status(err.status).json({
    status: err.status === 500 ? "fail" : "error",
    code: err.status,
    message: err.message,
    data: err.status === 500 ? "Internal Server Error" : err.data,
  });
});

module.exports = app;
