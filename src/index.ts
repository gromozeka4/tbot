import TelegramBot, {InlineKeyboardMarkup} from 'node-telegram-bot-api';
import {setInterval} from 'timers';
import {saveUser, getUser, deleteUser, getUsers} from './dataBase';

require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

const youTubeLinkOne = "YOUTUBE_LINK1";
const youTubeLinkTwo = "YOUTUBE_LINK2";
const youTubeLinkThree = "YOUTUBE_LINK3";

// Keyboards for different stages
const startLearningKeyboard: InlineKeyboardMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Начать курс",
          callback_data: "startLearningKeyboard",
        },
      ],
    ],
  }
};

const stageOneKeyboard: InlineKeyboardMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Я выполнил задание 1",
          callback_data: "stageOneCompleted",
        },
      ],
    ],
  }
};


const stageTwoKeyboard: InlineKeyboardMarkup = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Я выполнил задание 2",
          callback_data: "stageTwoCompleted",
        },
      ],
    ],
  }
};

// Button press handlers
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const user = await getUser(chatId);

  console.log("chatID: " + query.message.chat.id);
  console.log(query.data);
  console.log("user: " + JSON.stringify(user, null, 2));

  if (query.data === 'startLearningKeyboard') {
    console.log("New course started");
    bot.sendMessage(chatId, `Ссылка на задание 1: ${youTubeLinkOne}`, stageOneKeyboard);
    saveUser({chatId, currentStage: 1, lastActive: Date.now()});
  } else {
    switch (user.currentStage) {
      case 1:
        if (query.data === 'stageOneCompleted') {
          console.log("case 1: " + user.currentStage);
          bot.sendMessage(chatId, `Ссылка на задание 2: ${youTubeLinkTwo}`, stageTwoKeyboard);
          saveUser({chatId, currentStage: 2, lastActive: Date.now()});
        }
        break;

      case 2:
        if (query.data === 'stageOneCompleted') {
          console.log("Stage one completed");
          bot.sendMessage(chatId, `Ссылка на задание 2: ${youTubeLinkTwo}`, stageTwoKeyboard);
          saveUser({chatId, currentStage: 3, lastActive: Date.now()});
        } else if (query.data === 'stageTwoCompleted') {
          console.log("case 2: " + user.currentStage);
          bot.sendMessage(chatId, `Ссылка на задание 3: ${youTubeLinkThree}`);
          saveUser({chatId, currentStage: 3, lastActive: Date.now()});
        }
        break;

      case 3:
        if (query.data === 'stageTwoCompleted') {
          console.log("Stage two completed");
          bot.sendMessage(chatId, `Ссылка на задание 3: ${youTubeLinkThree}`);
          saveUser({chatId, currentStage: 4, lastActive: Date.now()});
        }
        break;

      default:
        console.log("default case : " + user.currentStage);
        bot.sendMessage(chatId, 'Ссылка на обучающее видео №1: YOUTUBE_LINK', stageOneKeyboard);
        saveUser({chatId, currentStage: 1, lastActive: Date.now()});
    }
  }
});

// /start command handler
bot.onText(/\/start/, async (msg) => {

  // TODO Start course from the very beginning

  const chatId = msg.chat.id;
  const user = await getUser(chatId);

  switch (user.currentStage) {
    case 1:
      console.log("case 1: " + user.currentStage);
      bot.sendMessage(chatId, `Ссылка на задание 1: ${youTubeLinkOne}`, stageOneKeyboard);
      saveUser({chatId, currentStage: 1, lastActive: Date.now()});
      break;

    case 2:
      console.log("case 2: " + user.currentStage);
      bot.sendMessage(chatId, `Ссылка на задание 2: ${youTubeLinkTwo}`, stageTwoKeyboard);
      saveUser({chatId, currentStage: 2, lastActive: Date.now()});
      break;

    case 3:
      console.log("case 3: " + user.currentStage);
      bot.sendMessage(chatId, `Ссылка на задание 3: ${youTubeLinkThree}`);
      saveUser({chatId, currentStage: 3, lastActive: Date.now()});
      break;

    default:
      console.log(`[${new Date()}] New user with chatId: ${chatId}, currentStage: ${user.currentStage}`);
      bot.sendMessage(chatId, 'Приветствую!', startLearningKeyboard);
      saveUser({chatId, currentStage: 0, lastActive: Date.now()});
  }
});

// Idle handler
// Start the timer to keep track of inactive users
setInterval(() => {
  const now = Date.now();
  getUsers()
    .then(users => {
      users.forEach(user => {
        const lastActive = user.lastActive;
        const chatId = user.chatId;
        const inactiveTime = (now - lastActive) / 1000; // convert to seconds
        if (inactiveTime > 60 * 60 * 24 * 30) { // 30 days
          // Remove inactive user from the database
          deleteUser(chatId)
            .then(() => {
              console.log(`User ${chatId} has been deleted due to inactivity`);
            })
            .catch(err => {
              console.error(err.message);
            });
        }
      });
    })
    .catch(err => {
      console.error(err.message);
    });
}, 60 * 60 * 1000); // check every hour

console.log('Bot is running...');
