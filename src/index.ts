import TelegramBot, {InlineKeyboardMarkup} from 'node-telegram-bot-api';
import {setInterval} from 'timers';
import {saveUser, getUser, deleteUser, getUsers} from './dataBase';

require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

const instagramLink = "https://instagram.com/trener_zdorovie?igshid=MzRlODBiNWFlZA=";
const greating = "Всем привет! Очень рада, что вы интересуетесь этой темой, и я надеюсь, что мои видео будут полезными для вас. Если у вас возникнут вопросы, вы всегда можете задать их в директ в Instagram.\n\n" +
  "Детокс - это не просто модное слово, а мощный инструмент, помогающий нам очищать организм от вредных веществ и восстанавливать естественное равновесие. В нашей современной жизни мы постоянно подвергаемся воздействию загрязненной окружающей среды, плохому питанию, стрессу и другим факторам, которые негативно сказываются на нашем здоровье и самочувствии. Детокс позволяет нам сбросить этот балласт и начать с чистого листа.\n\n" +
  "В своих видео я расскажу вам, из чего должен состоять правильный детокс, как запустить процессы очищения и поделюсь с вами детокс-рационом на один день.\n\n" +
  "Подписывайтесь на мой Instagram. Буду очень благодарна вам за отметки в сторис. Таким образом, вы поможете большему количеству людей узнать, как правильно помочь своему организму предотвратить многие болезни, наполниться энергией и восстановить баланс.\n\n" +
  "Сделайте скриншот с видео со мной и поделитесь тем, что для вас стало полезным.\n\n" +
  `Вот ссылка на мой Instagram: ${instagramLink}\n\n`;

const youTubeLinkOne = "https://youtu.be/g7uuqybFPYA";
const youTubeLinkTwo = "https://youtu.be/ahS2ZrfFv28";
const youTubeLinkThree = "https://youtu.be/DjzCSy4J1u8";

const videoOneText = "Привет! Я рада, что ты решил(а) присоединиться к курсу по детоксу! 🌱\n\nСейчас я отправлю тебе ссылку на первое видео, которое поможет тебе разобраться в основах детокса и его преимуществах. Уверена, тебе будет интересно и полезно!\n\nНе забудь посмотреть видео и выполнить задание, которое я отправлю после просмотра. Вперед! 💪";
const videoTwoText =`Отлично! Ты справился(лась) с первым заданием! 🌿\n\nВот ссылка на второе видео: ${youTubeLinkTwo}\n\n`;
const videoThreeText = `Поздравляю! Ты успешно завершил все задания! 🌿🎉\n\nСсылка на последнее видео: ${youTubeLinkThree}\n\nСпасибо, что приняли участие в нашем курсе! Надеюсь, информация, которую вы получили, была полезной и вдохновила вас на здоровые изменения в вашей жизни.\n\nЕсли вы хотите узнать еще больше и получить доступ к расширенному курсу, приглашаю вас присоединиться к моему платному курсу в Instagram.\n\nПодписывайтесь на мой Instagram ${instagramLink} для получения дополнительной информации и персональной поддержки. Буду рада видеть вас там!\n\nСпасибо еще раз и желаю вам здоровья и благополучия!`;

const testLinkOne = "https://docs.google.com/document/d/1T-HUsJ-Q3jF9iXKL3dC1jVE1zrrF9RkpAemVryqtn6U/edit?usp=sharing";
const testLinkTwo = "https://docs.google.com/document/d/19qd6gxygZnK3VbEc-DWr-O0HWKNaL2Pr5Hbi_yplwHg/edit?usp=sharing";

const taskOneText = `После просмотра время выполнить задание! Вот ссылка на первый тест: ${testLinkOne}. После выполнения жди новые видео и задания, чтобы продолжить свой путь к здоровью и балансу. Удачи! 💪`;
const taskOneTwo = `Новое видео и новое задание! Вот ссылка на второй тест: ${testLinkTwo}. Удачи! 💪`;



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
          text: "💪 Я выполнил тест 1 💪",
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
          text: "💪 Я выполнил тест 2 💪",
          callback_data: "stageTwoCompleted",
        },
      ],
    ],
  }
};

function sleep(ms = 1500) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Button press handlers
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const user = await getUser(chatId);

  console.log("chatID: " + query.message.chat.id);
  console.log(query.data);
  console.log("user: " + JSON.stringify(user, null, 2));

  if (query.data === 'startLearningKeyboard') {
    console.log(`[${new Date()}] New course started`);
    bot.sendMessage(chatId, videoOneText);
    await sleep(5000);
    bot.sendMessage(chatId, youTubeLinkOne);
    await sleep();
    bot.sendMessage(chatId, taskOneText, stageOneKeyboard);
    saveUser({chatId, currentStage: 1, lastActive: Date.now()});
  } else {
    switch (user.currentStage) {
      case 1:
        if (query.data === 'stageOneCompleted') {
          console.log(`[${new Date()}] case1: chatId: ${chatId} - New action at stage ${user.currentStage}`);
          bot.sendMessage(chatId, videoTwoText);
          await sleep();
          bot.sendMessage(chatId, taskOneTwo, stageTwoKeyboard);
          saveUser({chatId, currentStage: 2, lastActive: Date.now()});
        }
        break;

      case 2:
        if (query.data === 'stageOneCompleted') {
          console.log("Stage one completed");
          bot.sendMessage(chatId, videoTwoText);
          await sleep();
          bot.sendMessage(chatId, taskOneTwo, stageTwoKeyboard);
          saveUser({chatId, currentStage: 3, lastActive: Date.now()});
        } else if (query.data === 'stageTwoCompleted') {
          console.log(`[${new Date()}] case2: chatId: ${chatId} - New action at stage ${user.currentStage}`);
          bot.sendMessage(chatId, videoThreeText);
          saveUser({chatId, currentStage: 3, lastActive: Date.now()});
        }
        break;

      case 3:
        if (query.data === 'stageTwoCompleted') {
          console.log("Stage two completed");
          bot.sendMessage(chatId, videoThreeText);
          saveUser({chatId, currentStage: 4, lastActive: Date.now()});
        }
        break;

      case 4:
        bot.sendMessage(chatId, videoThreeText);
        break;

      default:
        console.log(`[${new Date()}] default case: chatId: ${chatId} - New action at stage ${user.currentStage}`);
        bot.sendMessage(chatId, videoOneText);
        await sleep();
        bot.sendMessage(chatId, youTubeLinkOne);
        await sleep();
        bot.sendMessage(chatId, taskOneText, stageOneKeyboard);
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
      console.log(`[${new Date()}] case1: chatId: ${chatId} - New action at stage ${user.currentStage}`);
      bot.sendMessage(chatId, videoOneText);
      await sleep();
      bot.sendMessage(chatId, youTubeLinkOne);
      await sleep();
      bot.sendMessage(chatId, taskOneText, stageOneKeyboard);
      saveUser({chatId, currentStage: 1, lastActive: Date.now()});
      break;

    case 2:
      console.log(`[${new Date()}] case2: chatId: ${chatId} - New action at stage ${user.currentStage}`);
      bot.sendMessage(chatId, videoTwoText);
      await sleep();
      bot.sendMessage(chatId, taskOneTwo, stageTwoKeyboard);
      saveUser({chatId, currentStage: 2, lastActive: Date.now()});
      break;

    case 3:
      console.log(`[${new Date()}] case3: chatId: ${chatId} - New action at stage ${user.currentStage}`);
      bot.sendMessage(chatId, videoThreeText);
      saveUser({chatId, currentStage: 3, lastActive: Date.now()});
      break;

    default:
      console.log(`[${new Date()}] New user with chatId: ${chatId}, currentStage: ${user.currentStage}`);
      bot.sendMessage(chatId, greating, startLearningKeyboard);
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
        if (inactiveTime > 60 * 60 * 24 * 60) { // 60 days
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
