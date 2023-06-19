import { Client } from 'pg'
import { User } from './types';


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Set to true if PostgreSQL database requires SSL
  }
});

client.connect((err) => {
  if (err) {
    console.error(err.message);
  // } else {if () {
  //     console.log(`Database file ${dbPath} not found. Created a new one.`);
  //     client.query(`
  //       CREATE TABLE IF NOT EXISTS users (
  //         chatId BIGINT PRIMARY KEY,
  //         currentStage INTEGER NOT NULL,
  //         lastActive BIGINT NOT NULL
  //       )
  //     `);
    // }
  } else {
    console.log(`Connected to the PostgreSQL database`);
  }
});

export function getUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM users`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const users = result.rows as User[];
        resolve(users);
      }
    });
  });
}

export function saveUser(user: User) {
  const { chatId, currentStage, lastActive } = user;
  client.query(
    `INSERT INTO users (chatId, currentStage, lastActive) VALUES ($1, $2, $3)
    ON CONFLICT (chatId)
    DO UPDATE SET currentStage = $2, lastActive = $3`,
    [chatId, currentStage, lastActive],
    (err) => {
      if (err) {
        console.error(err.message);
      }
    }
  );
}

export function getUser(chatId: number): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM users WHERE chatId = $1`, [chatId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.rows.length === 0) {
          console.log(`New user connected with chatId: ${chatId}`);
          const user: User = { chatId, currentStage: 0, lastActive: Date.now() };
          resolve(user);
        } else {
          const user = result.rows[0] as User;
          resolve(user);
        }
      }
    });
  });
}

export function getUsersCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    client.query(`SELECT COUNT(*) as count FROM users`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows[0].count);
      }
    });
  });
}

export function deleteUser(chatId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    client.query(`DELETE FROM users WHERE chatId = $1`, [chatId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
