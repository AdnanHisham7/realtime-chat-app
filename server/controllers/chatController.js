const Chat = require("../models/Chat");
const Message = require("../models/Message")

//! Create a new chat or return an existing one
const createChat = async (req, res) => {
  const { firstUserId, secondUserId } = req.body;

  // Validate input
  if (!firstUserId || !secondUserId) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  try {
    // Check if chat between users already exists
    const existingChat = await Chat.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });

    if (existingChat) {
      return res.status(200).json({ message: "Chat already exists.", chat: existingChat });
    }

    // Create a new chat if none exists
    const newChat = new Chat({
      members: [firstUserId, secondUserId],
    });

    const savedChat = await newChat.save();
    return res.status(201).json({ message: "Chat created successfully.", chat: savedChat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//! retrieve all chats for a specific user
const getUserChats = async (req, res) => {
  const { userId } = req.params;
  // Validate input
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Fetch chats where the user is a member
    const chats = await Chat.find({
      members: { $in: [userId] },
    });

    return res.status(200).json({ message: "User chats fetched successfully.", chats });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//! Retrieve a chat between two specific users
const getChat = async (req, res) => {
  const { firstUserId, secondUserId } = req.params;

  // Validate input
  if (!firstUserId || !secondUserId) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  try {
    // fetch chat between two users
    const chat = await Chat.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });

    // if the chat don't exists
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    return res.status(200).json({ message: "Chat fetched successfully.", chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const deleteAllChats = async (req, res) => {
  try {
      const userId = req.user.id; 

      const userChats = await Chat.find({ members: userId });
      const chatIds = userChats.map(chat => chat._id);

      await Message.deleteMany({ chatId: { $in: chatIds } });
      await Chat.deleteMany({ _id: { $in: chatIds } });

      res.status(200).json({ message: "All chats and messages deleted successfully" });
  } catch (error) {
      console.error("Error deleting chats:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  createChat,
  getUserChats,
  getChat,
  deleteAllChats
};
