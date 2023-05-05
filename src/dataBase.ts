import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { User } from './types';

const dbPath =  './dataBase.sqlite';
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    if (!dbExists) {
      console.log(`Database file ${dbPath} not found. Created a new one.`);
      db.run(`
        CREATE TABLE users (
          chatId INTEGER PRIMARY KEY,
          currentStage INTEGER NOT NULL,
          lastActive INTEGER NOT NULL
        )
      `);
    }
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

export function getUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const users = rows.map((row) => row as User);
        resolve(users);
      }
    });
  });
}

export function saveUser(user: User) {
  const {chatId, currentStage, lastActive } = user;
  db.run(
    `INSERT OR REPLACE INTO users (chatId, currentStage, lastActive) VALUES (?, ?, ?)`,
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
    db.get(`SELECT * FROM users WHERE chatId = ?`, [chatId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (!row) {
          console.log(`New user connected with chatId: ${chatId}`);
          const user = { chatId, currentStage: 0, lastActive: Date.now() };
          resolve(user);
        } else {
          const user = row as User;
          resolve(user);
        }
      }
    });
  });
}


export function deleteUser(chatId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE chatId = ?`, [chatId], err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
