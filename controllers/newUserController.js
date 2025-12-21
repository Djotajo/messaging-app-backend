import db from "../db/queries.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const passErr =
  "must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.";

const validateUser = [
  body("username")
    .trim()
    .isAlpha()
    .withMessage("Username must only contain letters")
    .isLength({ min: 1, max: 10 })
    .withMessage("Username must be between 1 and 10 characters"),

  body("password").custom((value) => {
    if (value.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    return true;
  }),
  body("password")
    .matches(/[a-z]/)
    .withMessage("Password must include at least 1 lowercase letter"),
  body("password")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least 1 uppercase letter"),
  body("password")
    .matches(/[0-9]/)
    .withMessage("Password must include at least 1 number"),
  body("password")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must include at least 1 symbol"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const newUserCreate = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation failed for signup request:", errors.array());

      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          param: err.param,
          msg: err.msg,
        })),
      });
    }

    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.postNewUser(username, hashedPassword);

      return res.status(201).json({
        message: "User created",
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        error.meta?.target?.includes("username")
      ) {
        return res
          .status(409)
          .json({ message: "An account with this username already exists." });
      }

      console.error("Error creating user:", error);
      return res.status(500).json({
        message: "Server error",
        errors: [{ msg: "Something went wrong. Please try again." }],
      });
    }
  },
];

export default {
  newUserCreate,
};
