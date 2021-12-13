// external imports
const createError = require("http-errors");
// internal imports
const { ResultWithContext } = require("express-validator/src/chain");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/People");
const escape = require("../utilities/escape");

// get inbox page
async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    });

    res.locals.data = conversations;
    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

// search useer
async function searchUser(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  try {
    if (searchQuery !== "") {
      const users = await User.find(
        {
          $or: [
            {
              name: name_search_regex,
            },
            {
              mobile: mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
        },
        "name avatar"
      );

      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// add conversation

async function addConversation(req, res, next) {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.userid,
        name: req.user.username,
        avator: req.user.avator || null,
      },
      participant: {
        name: req.body.participant,
        id: req.body.id,
        avator: req.body.avatar || null,
      },
    });

    const result = await newConversation.save();
    res.status(500).json({
      message: "Conversation was added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// get message
async function getMessages(req, res, next) {
  try {
    const message = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createAt");

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );

    res.status(200).json({
      data: {
        message: message,
        participant,
      },
      user: req.user.userid,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknows error occured!",
        },
      },
    });
  }
}

// send mew message

async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in datavase
      let attachments = null;

      if (req.files && req.files.length > 0) {
        attachments = [];
        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }

      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        serder: {
          id: req.user.username,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avator: req.body.avatar || null,
        },
        conversation_id: req.body.conversationId,
      });

      const result = await newMessage.save();

      // emit socket event
      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userid,
            name: req.user.username,
            avator: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: result.data_time,
        },
      });

      res.status(200).json({
        message: "Successfull!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: {
          msg: "Message test or attachment is required!",
        },
      },
    });
  }
}

// export modules
module.exports = {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
};
