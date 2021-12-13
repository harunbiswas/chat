const mongoose = require("mongoose");

const consversationSchema = mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      avarar: String,
    },

    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatat: String,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", consversationSchema);

module.exports = Conversation;
