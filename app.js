let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let usersRouter = require("./routes/users");
const passport = require("./utils/passport");
const { sequelize } = require("./models/users");

let app = express();

const checkDbConn = () => {
  return (
    sequelize
      .authenticate()
      .then(() => {
        console.log("Connection to database successful!");
      })
      // eslint-disable-next-line no-unused-vars
      .catch((err) => {
        console.log("Unable to connect to database!");
      })
  );
};
checkDbConn();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use("/users", usersRouter);

module.exports = app;
