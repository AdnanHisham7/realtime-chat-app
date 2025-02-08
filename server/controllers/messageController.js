const Message = require("../models/Message");
const Chat = require("../models/Chat")

//! create a new message in a chat
const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  // Validate input
  if (!chatId || !senderId || !text) {
    return res.status(400).json({ message: "chatId, senderId, and text are required." });
  }

  try {
    // Create a message and save it
    const newMessage = new Message({ chatId, senderId, text });
    const savedMessage = await newMessage.save();

    return res.status(201).json({
      message: "Message created successfully.",
      savedMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//! Retrieve all messages for a specific chat
const getMessages = async (req, res) => {
  const { chatId } = req.params;

  // Validate input
  if (!chatId) {
    return res.status(400).json({ message: "chatId is required." });
  }

  try {
    // fetch messages for the given chat
    const messages = await Message.find({ chatId });

    return res.status(200).json({
      message: "Messages fetched successfully.",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const deleteAllMessages = async (req, res) => {
  try {
      const userId = req.user.id;
      
      const userChats = await Chat.find({ members: userId });
      const chatIds = userChats.map(chat => chat._id);

      await Message.deleteMany({ chatId: { $in: chatIds } });

      res.status(200).json({ message: "All messages deleted successfully" });
  } catch (error) {
      console.error("Error deleting messages:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createMessage,
  getMessages,
  deleteAllMessages
};
