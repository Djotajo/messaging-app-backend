const { Router } = require("express");

const postRouter = Router();

const db = require("../db/queries");
const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.role !== "user") {
      return res.status(403).json({ message: "Forbidden: Not a user" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed", err);
    return res.status(401).json({ message: "Token verification failed" });
  }
}

// GET ALL POSTS
postRouter.get("/", async (req, res) => {
  const posts = await db.getAllPosts();
  res.json(posts);
});

// GET POST BY ID
postRouter.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await db.getPost(postId);
  res.json(post);
});

// POST NEW COMMENT
postRouter.post("/:postId/comments", authenticateUser, async (req, res) => {
  const { postId } = req.params;
  const { text, userId, authorId } = req.body;
  const parentId = postId;

  const comment = await db.postNewComment(text, userId, authorId, parentId);
  res.json(comment);
});

// EDIT COMMENT
postRouter.put(
  "/:postId/comments/:commentId",
  authenticateUser,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const comment = await db.editComment(commentId, text);
    res.json(comment);
  }
);

// DELETE COMMENT
postRouter.delete(
  "/:postId/comments/:commentId",
  authenticateUser,
  async (req, res) => {
    const { commentId } = req.params;
    const comment = await db.deleteComment(commentId);
    res.json(comment);
  }
);

module.exports = postRouter;
