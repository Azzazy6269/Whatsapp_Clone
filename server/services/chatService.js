const Chat = require('../models/Chat');
const User = require('../models/User');

const accessOrCreateChat = async (currentUserId, targetUserId, targetEmail) => {
  let resolvedUserId = targetUserId;

  if (typeof resolvedUserId === "string" && resolvedUserId.includes("@")) {
    targetEmail = resolvedUserId;
    resolvedUserId = undefined;
  }

  if (!resolvedUserId && targetEmail) {
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      throw new Error("User not found with this email");
    }
    resolvedUserId = user._id; 
  }

  if (!resolvedUserId) {
    throw new Error("UserId param not sent with request");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: currentUserId } } },
      { users: { $elemMatch: { $eq: resolvedUserId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email avatar",
  });

  if (isChat.length > 0) {
    return isChat[0];
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [currentUserId, resolvedUserId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
    return fullChat;
  }
};

const getAllChats = async (currentUserId) => {
  let chats = await Chat.find({ users: { $elemMatch: { $eq: currentUserId } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name email avatar",
  });

  return chats;
};

const createGroup = async (groupName, usersData, currentUser) => {
  if (!usersData || !groupName) {
    throw new Error("Please fill all the fields");
  }

  let users = JSON.parse(usersData);

  if (users.length < 2) {
    throw new Error("More than 2 users are required to form a group chat");
  }

  users.push(currentUser);

  const groupChat = await Chat.create({
    chatName: groupName,
    users: users,
    isGroupChat: true,
    groupAdmin: currentUser,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return fullGroupChat;
};

module.exports = {
  accessOrCreateChat,
  getAllChats,
  createGroup,
};