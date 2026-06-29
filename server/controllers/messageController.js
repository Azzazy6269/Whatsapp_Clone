const messageService = require('../services/messageService');

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  try {
    const message = await messageService.createMessage(req.user._id, chatId, content);
    res.status(201).json(message);
  } catch (error) {
    if (error.message === "Invalid data passed into request") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageService.getChatMessages(chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages };