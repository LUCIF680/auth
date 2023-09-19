const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/users");
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_KEY,
};

passport.use(
  new LocalStrategy(
    {
      emailField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, email, plainPassword, done) {
      let err = null;
      if (err) {
        return done(err);
      }

      const { password } = await User.findOne({
        where: { email },
      });

      if (bcrypt.compare(plainPassword, password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, email);
    }
  )
);

const jwtAuth = new JwtStrategy(jwtOptions, async (payload, done) => {
  const user = await User.findOne({
    attributes: { exclude: ["password"] },
    where: { email: payload.sub },
  });
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(jwtAuth);

module.exports = passport;
