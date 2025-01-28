const express = require("express");
const router = express.Router();

const {
  createChat,
  getUserChats,
  getChat,
} = require("../controllers/chatController");

router.post("/", createChat);
router.get("/:userId", getUserChats);
router.get("/find/:firstUserId/:secondUserId", getChat);

module.exports = router;
