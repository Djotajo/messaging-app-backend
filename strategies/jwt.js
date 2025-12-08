// const JwtStrategy = require("passport-jwt").Strategy;
// const ExtractJwt = require("passport-jwt").ExtractJwt;
// const opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = "SECRET_KEY"; //normally store this in process.env.secret

// module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
//   if (jwt_payload.email === "paul@nanosoft.co.za") {
//     return done(null, true);
//   }
//   return done(null, false);
// });

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const db = require("../db/queries"); // or wherever your user lookup is

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY, // ✅ use env var
};

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    // Example: check user in DB
    const user = await db.getUserByUsername(jwt_payload.username);

    if (user) {
      return done(null, user); // user attached to req.user
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});
