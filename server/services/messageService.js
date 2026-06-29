const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

const createMessage = async (currentUserId, chatId, content) => {
  if (!content || !chatId) {
    throw new Error("Invalid data passed into request");
  }

  const newMessage = {
    sender: currentUserId,
    content: content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  message = await message.populate("sender", "name avatar");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name email avatar",
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  return message;
};

const getChatMessages = async (chatId) => {
  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name email avatar")
    .populate("chat");
    
  return messages;
};

module.exports = {
  createMessage,
  getChatMessages,
};