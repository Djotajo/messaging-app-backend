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

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      // where: { username: username },
      // da li omoguciti chat sa samim sobom
    });
    return users;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error };
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

async function getChatsByUser(userId) {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
    return chats;
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

async function postNewMessage(text, userId, chatId) {
  try {
    const message = await prisma.message.create({
      data: { text, userId, chatId },
    });
    return message;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

async function postUpdateUser(userId, about, picture) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        about,
        picture,
      },
    });

    return user;
  } catch (error) {
    console.error("Database error updating post:", error);
    throw error;
  }
}

module.exports = {
  postNewUser,
  getAllUsers,
  getChatByUsers,
  getChatsByUser,
  postNewChat,
  postNewMessage,
  postUpdateUser,
};
