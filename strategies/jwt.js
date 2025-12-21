// const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
// const db = require("../db/queries");

// const opts = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.SECRET_KEY,
// };

// module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
//   try {
//     const user = await db.getUserByUsername(jwt_payload.username);

//     if (user) {
//       return done(null, user);
//     } else {
//       return done(null, false);
//     }
//   } catch (error) {
//     return done(error, false);
//   }
// });

import passportJwt from "passport-jwt";
import db from "../db/queries.js";

const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

const jwtStrategy = new JwtStrategy(async (jwt_payload, done) => {
  try {
    const user = await db.getUserByUsername(jwt_payload.username);

    if (user) {
      return done(null, user); // attached to req.user
    }

    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

export default jwtStrategy;
