const { Router } = require("express");

const { Prisma } = require("@prisma/client");

const { v4: uuidv4 } = require("uuid");

const chatRouter = Router();

const db = require("../db/queries");
const chatController = require("../controllers/chatController");

chatRouter.get("/", async (req, res) => {
  res.send("success");
});

chatRouter.get("/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const chat = await db.getChatById(chatId);
  res.json(chat);
});

chatRouter.post("/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const { text, userId } = req.body;
  const message = await db.postNewMessage(text, userId, chatId);
  res.json(message);
});

export default chatRouter;
