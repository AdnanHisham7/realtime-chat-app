const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');

const {
  createChat,
  getUserChats,
  getChat,
  deleteAllChats
} = require("../controllers/chatController");

router.post("/", createChat);
router.get("/:userId", getUserChats);
router.get("/find/:firstUserId/:secondUserId", getChat);
router.delete('/delete-all', auth, deleteAllChats);

module.exports = router;
