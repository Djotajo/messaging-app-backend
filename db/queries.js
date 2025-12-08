const prisma = require("./prisma");

async function postNewUser(username, hashedPassword) {
  try {
    const user = await prisma.user.create({
      data: { username: username, passwordHash: hashedPassword },
    });
    return user;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getChatByUsers(user1Id, user2Id) {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });
    return chat;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function postNewChat(user1Id, user2Id) {
  try {
    const chat = await prisma.chat.create({
      data: { user1Id, user2Id },
    });
    return chat;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const [author, user] = await Promise.all([
      prisma.author.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { username } }),
    ]);
    if (author) {
      return { role: "author", user: author };
    }
    if (user) {
      return { role: "user", user };
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error };
  }
}

async function getUser(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    return user;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error };
  }
}

async function getPostsByAuthor(authorId) {
  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        Post: {
          include: {
            Comment: true,
          },
        },
      },
    });

    if (!author) {
      return null;
    }
    return author;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getAllPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: true,
        Comment: true,
      },
    });

    if (!posts) {
      return null;
    }

    return posts;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getAllDrafts() {
  try {
    const drafts = await prisma.post.findMany({
      where: { published: false },
      include: {
        author: true,
      },
    });

    if (!drafts) {
      return null;
    }
    return drafts;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getAllDraftsByAuthor(authorId) {
  try {
    const drafts = await prisma.post.findMany({
      where: { published: false, authorId: authorId },
      include: {
        author: true,
      },
    });

    if (!drafts) {
      return null;
    }

    return drafts;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getAllPostsByAuthor(authorId) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: authorId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!posts) {
      return null;
    }

    return posts;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getPost(postId) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        text: true,
        author: true,
        createdAt: true,
        Comment: {
          include: {
            commentByUser: {
              select: {
                id: true,
                username: true,
              },
            },
            commentByAuthor: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function postNewPost(id, title, text, authorId, published) {
  try {
    const post = await prisma.post.create({
      data: {
        id,
        title,
        text,
        authorId,
        published,
      },
    });

    return post;
  } catch (error) {
    console.error("Database error creating post:", error);
    throw error;
  }
}

async function postNewComment(text, userId = null, authorId = null, parentId) {
  if (!userId && !authorId) {
    throw new Error(
      "A comment must be associated with either a user or an author."
    );
  }

  if (userId && authorId) {
    throw new Error(
      "A comment cannot be associated with both a user and an author."
    );
  }

  try {
    const data = {
      text,
      ...(userId && { userId }),
      ...(authorId && { authorId }),
      parentId,
    };
    const comment = await prisma.comment.create({ data });

    return comment;
  } catch (error) {
    console.error("Database error creating comment:", error);
    throw new Error("Failed to create comment.");
  }
}

async function editComment(commentId, text) {
  try {
    const comment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: {
        text,
      },
    });

    return comment;
  } catch (error) {
    console.error("Database error editing comment:", error);
    throw new Error("Failed to edit comment bro.");
  }
}

async function updatePost(postId, title, text, published, createdAt) {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        text,
        published,
        createdAt,
      },
    });

    return post;
  } catch (error) {
    console.error("Database error updating post:", error);
    throw error;
  }
}

async function updateDraft(postId, title, text) {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        text,
      },
    });

    return post;
  } catch (error) {
    console.error("Database error updating post:", error);
    throw new Error("Failed to update post.");
  }
}

async function postPostPublish(postId) {
  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        published: true,
      },
      include: {
        author: true,
      },
    });

    return updatedPost;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function postPostUnpublish(postId) {
  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        published: false,
      },
      include: {
        author: true,
      },
    });

    return updatedPost;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function getPostComments(postId) {
  try {
    const comments = await prisma.comment.findMany({
      where: { parentId: postId },
      orderBy: { createdAt: "asc" },
      include: {
        commentByUser: true,
        commentByAuthor: true,
      },
    });

    return comments;
  } catch (error) {
    console.error("Database error:", error);
    return { error };
  }
}

async function deletePost(postId) {
  try {
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }
    await prisma.post.delete({
      where: { id: postId },
    });
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error };
  }
}

async function deleteComment(commentId) {
  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!existingComment) {
      return { success: false, error: "Comment not found" };
    }
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error };
  }
}

module.exports = {
  postNewAuthor,
  postNewUser,
  getUserByUsername,
  getAuthor,
  getUser,
  getPostsByAuthor,
  getAllPosts,
  getAllDrafts,
  getAllDraftsByAuthor,
  getAllPostsByAuthor,
  getPost,
  getPostComments,
  postNewPost,
  postNewComment,
  editComment,
  updatePost,
  updateDraft,
  postPostPublish,
  postPostUnpublish,
  deletePost,
  deleteComment,
};
