const express = require("express");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const fileUpload = require("express-fileupload");

require("./db/mongoose.js");

const userRouter = require("./routers/user-router.js");
const taskRouter = require("./routers/task-router.js");

const app = express();
const port = process.env.PORT;

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.use(session({secret: process.env.SESSION_SECRET, saveUninitialized: true, resave: true}));

app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

app.use(userRouter);
app.use(taskRouter);

app.listen(port);