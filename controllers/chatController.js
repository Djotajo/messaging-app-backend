function normalizeUserPair(a, b) {
  return a < b ? { user1Id: a, user2Id: b } : { user1Id: b, user2Id: a };
}

const { user1Id, user2Id } = normalizeUserPair(currentUserId, otherUserId);

const chat = await prisma.chat.upsert({
  where: { user1Id_user2Id: { user1Id, user2Id } },
  update: {},
  create: {
    user1Id,
    user2Id,
  },
});

async function getChatByUsers(user1Id, user2Id) {}
