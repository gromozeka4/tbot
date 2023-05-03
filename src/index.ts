import TelegramBot, { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { setInterval } from 'timers';

const bot = new TelegramBot('Token', { polling: true });

const youTubeLinkOne = "YOUTUBE_LINK1";
const youTubeLinkTwo = "YOUTUBE_LINK2";
const youTubeLinkThree = "YOUTUBE_LINK3";
interface User {
  currentStage: number;
  lastActive: number;
}

const users = new Map<number, User>();

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
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const user = users.get(chatId);

  console.log("query.message.chat.id: " + query.message.chat.id);
  console.log("user: " + JSON.stringify(user, null, 2));

  if (user) {
    if (query.data === 'startLearningKeyboard') {
      console.log("New course started");
      bot.sendMessage(chatId, `Ссылка на задание 1: ${youTubeLinkOne}`, stageOneKeyboard);
      users.set(chatId, { currentStage: 2, lastActive: Date.now() });
    } else {
      switch (user.currentStage) {
        case 1:
          console.log("case 1: " + user.currentStage);
          bot.sendMessage(chatId, `Ссылка на задание 1: ${youTubeLinkOne}`, stageOneKeyboard);
          users.set(chatId, { currentStage: 2, lastActive: Date.now() });
          break;

        case 2:
          if (query.data === 'stageOneCompleted') {
            console.log("case 2 if Stage1 complete: " + user.currentStage);
            bot.sendMessage(chatId, `Ссылка на обучающее видео №2: ${youTubeLinkTwo}`, stageTwoKeyboard);
            users.set(chatId, { currentStage: 2, lastActive: Date.now() });
          } else if (query.data === 'stageTwoCompleted') {
            console.log("case 2 if Stage2 complete: " + user.currentStage);
            bot.sendMessage(chatId, `Ссылка на обучающее видео №3: ${youTubeLinkThree}`);
            users.set(chatId, { currentStage: 3, lastActive: Date.now() });
          }
          break;

        case 3:
          console.log("case 3 : " + user.currentStage);
          // TODO
          break;

        default:
          console.log("case 4 : " + user.currentStage);
          bot.sendMessage(chatId, 'Приветствую! Ссылка на обучающее видео №1: YOUTUBE_LINK', stageOneKeyboard);
          users.set(chatId, { currentStage: 1, lastActive: Date.now() });
      }
    }

  }
});

// /start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const user: User = { currentStage: 1, lastActive: Date.now() };
  bot.sendMessage(chatId, 'Приветствую!', startLearningKeyboard);
  users.set(chatId, user);
  console.log(`[${new Date()}] New user with chatId: ${chatId}`);
  console.log(`[${new Date()}] user.currentStage: : ${user.currentStage}`);
});

// Idle handler
setInterval(() => {
  users.forEach((user, userId) => {
    const elapsedTime = Date.now() - user.lastActive;
    if (elapsedTime > 30 * 60 * 1000) {
      users.delete(userId);
    }
  });
}, 60 * 1000); // each minute check

console.log('Bot is running...');
