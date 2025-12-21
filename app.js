import express from "express";
import path from "node:path";

import http from "node:http";

import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { neon } from "@neondatabase/serverless";

import prisma from "./db/prisma.js";

import "dotenv/config";

import db from "./db/queries.js";
import jwtStrategy from "./strategies/jwt.js";
import postRouter from "./routes/postRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import newUserController from "./controllers/newUserController.js";

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

passport.use(jwtStrategy);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const assetsPath = path.join(__dirname, "public");

app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(assetsPath));

app.use("/dashboard", dashboardRouter);

app.use("/posts", postRouter);

app.post("/login", async (req, res) => {
  let { username, password } = req.body;

  const user = await db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: "Username does not exist" });
  }
  const match = await bcrypt.compare(password, user.user.passwordHash);

  if (!match) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const signOpts = {};
  signOpts.expiresIn = "8h";
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    console.error("JWT_SECRET environment variable is not set!");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const token = jwt.sign(
    { username: user.user.username, id: user.user.id, role: user.role },
    secret,
    signOpts
  );
  return res.status(200).json({
    message: "Auth Passed",
    token,
  });
});

app.post("/signup", newUserController.newUserCreate);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

await prisma.chat.upsert({
  where: { id: "GLOBAL_CHAT" },
  update: {},
  create: {
    id: "GLOBAL_CHAT",
    user1Id: "SYSTEM",
    user2Id: "SYSTEM",
  },
});
