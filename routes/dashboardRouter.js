const { Router } = require("express");

const { Prisma } = require("@prisma/client");

const jwt = require("jsonwebtoken");

const dashboardRouter = Router();

const db = require("../db/queries");

function authenticateAuthor(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.role !== "author") {
      return res.status(403).json({ message: "Forbidden: Not an author" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed", err);
    return res.status(401).json({ message: "Token verification failed" });
  }
}

// GET POSTS BY AUTHOR
dashboardRouter.get("/posts", authenticateAuthor, async (req, res) => {
  const authorId = req.user.id;
  const posts = await db.getAllPostsByAuthor(authorId);
  res.json(posts);
});

// CREATE A NEW POST
dashboardRouter.post("/posts", authenticateAuthor, async (req, res) => {
  const { id, title, text, published } = req.body;
  const authorId = req.user.id;

  try {
    const post = await db.postNewPost(id, title, text, authorId, published);
    res.status(201).json(post);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      error.meta?.target?.includes("title")
    ) {
      return res
        .status(409)
        .json({ message: "A post with this title already exists." });
    }
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SPECIFIC POST BY ID
dashboardRouter.get("/posts/:postId", authenticateAuthor, async (req, res) => {
  const { postId } = req.params;
  const post = await db.getPost(postId);
  res.json(post);
});

// EDIT POST
dashboardRouter.put("/posts/:postId", authenticateAuthor, async (req, res) => {
  const { postId } = req.params;
  const { title, text, published, createdAt } = req.body;

  try {
    const post = await db.updatePost(postId, title, text, published, createdAt);
    res.status(200).json(post);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      error.meta?.target?.includes("title")
    ) {
      return res
        .status(409)
        .json({ message: "A post with this title already exists." });
    }
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE POST
dashboardRouter.delete(
  "/posts/:postId",
  authenticateAuthor,
  async (req, res) => {
    const { postId } = req.params;
    const post = await db.deletePost(postId);
    res.json(post);
  }
);

// GET SPECIFIC DRAFT BY ID
dashboardRouter.get("/drafts/:postId", authenticateAuthor, async (req, res) => {
  const { postId } = req.params;
  const draft = await db.getPost(postId);
  res.json(draft);
});

// UPDATE DRAFT
dashboardRouter.put("/drafts/:postId", authenticateAuthor, async (req, res) => {
  const { postId } = req.params;
  const { title, text, published, createdAt } = req.body;

  try {
    const draft = await db.updatePost(
      postId,
      title,
      text,
      published,
      createdAt
    );
    res.status(200).json(draft);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      error.meta?.target?.includes("title")
    ) {
      return res
        .status(409)
        .json({ message: "A post with this title already exists." });
    }
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST COMMENT
dashboardRouter.post(
  "/posts/:postId/comments",
  authenticateAuthor,
  async (req, res) => {
    const { postId } = req.params;
    const { text, authorId, userId } = req.body;
    const parentId = postId;
    const comment = await db.postNewComment(text, userId, authorId, parentId);
    res.json(comment);
  }
);

// EDIT COMMENT
dashboardRouter.put(
  "/:postId/comments/:commentId",
  authenticateAuthor,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const comment = await db.editComment(commentId, text);
    res.json(comment);
  }
);

// DELETE COMMENT
dashboardRouter.delete(
  "/posts/:postId/comments/:commentId",
  authenticateAuthor,
  async (req, res) => {
    const { commentId } = req.params;
    const comment = await db.deleteComment(commentId);
    res.json(comment);
  }
);

module.exports = dashboardRouter;
