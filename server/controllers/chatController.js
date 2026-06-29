const chatService = require('../services/chatService');

const accessChat = async (req, res) => {
  const { userId, email } = req.body;

  try {
    const chat = await chatService.accessOrCreateChat(req.user._id, userId, email);
    res.status(200).json(chat);
  } catch (error) {
    if (
      error.message === "UserId param not sent with request" || 
      error.message === "User not found with this email"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const fetchChats = async (req, res) => {
  try {
    const chats = await chatService.getAllChats(req.user._id);
    res.status(200).send(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createGroupChat = async (req, res) => {
  const { name, users } = req.body;

  try {
    const groupChat = await chatService.createGroup(name, users, req.user);
    res.status(200).json(groupChat);
  } catch (error) {
    if (
      error.message === "Please fill all the fields" || 
      error.message === "More than 2 users are required to form a group chat"
    ) {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { accessChat, fetchChats, createGroupChat };