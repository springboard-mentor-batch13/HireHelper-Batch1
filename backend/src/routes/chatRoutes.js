const router = require("express").Router();
const Message = require("../models/Message");

router.post("/save", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

router.get("/:taskId", async (req, res) => {
  const msgs = await Message.find({ taskId: req.params.taskId });
  res.json(msgs);
});

module.exports = router;