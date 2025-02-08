const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');

const {
  createMessage,
  getMessages,
  deleteAllMessages
} = require("../controllers/messageController");

router.post("/", createMessage);
router.get("/:chatId", getMessages);
router.delete('/delete-all', auth, deleteAllMessages);

module.exports = router;
