// db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = open({
  filename: "./database.db",
  driver: sqlite3.Database,
});
//teste

(async () => {
  const db = await dbPromise;
 
  // cria tabela users e user_questions se não existir (com as colunas novas)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      diamonds INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      streak_count INTEGER DEFAULT 0,
      last_completed_date TEXT DEFAULT NULL,
      selected_avatar INTEGER DEFAULT 0,
      selected_background INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      is_correct INTEGER NOT NULL,
      time_taken INTEGER DEFAULT 0,
      answered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // adiciona colunas novas se ainda não existirem
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN selected_avatar INTEGER DEFAULT 0;`);
  } catch (e) {}
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN selected_background INTEGER DEFAULT 0;`);
  } catch (e) {}
    try {
    await db.exec(`ALTER TABLE users ADD COLUMN unlocked_phases TEXT DEFAULT '["1"]';`);
  } catch (e) {}

  // cria tabela de compras
  await db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      item_name TEXT,
      type TEXT,
      cost INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // cria tabela de conquistas base
await db.exec(`
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    requirement_type TEXT,
    requirement_value INTEGER
  );
`);

// cria tabela para respostas do diagnóstico
await db.exec(`
  CREATE TABLE IF NOT EXISTS diagnostic_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question TEXT,
    answer TEXT,
    correct_answer TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);


// cria tabela relacional de conquistas desbloqueadas
await db.exec(`
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    achievement_id INTEGER,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
  );
`);

// insere conquistas base se ainda não existirem
const achievements = [
  { name: "Primeiro Passo", description: "Concluiu a primeira lição", icon: "puzzle", requirement_type: "xp", requirement_value: 10 },
  { name: "Em Frente!", description: "Concluiu 5 lições", icon: "rocket", requirement_type: "xp", requirement_value: 50 },
  { name: "Codificador Diário", description: "Manteve 3 dias de sequência", icon: "fire", requirement_type: "streak", requirement_value: 3 },
  { name: "Cliente Fiel", description: "Fez uma compra na loja", icon: "gift", requirement_type: "purchase_count", requirement_value: 1 },
];

for (const a of achievements) {
  try {
    await db.run(
      `INSERT INTO achievements (name, description, icon, requirement_type, requirement_value)
       VALUES (?, ?, ?, ?, ?)`,
      [a.name, a.description, a.icon, a.requirement_type, a.requirement_value]
    );
  } catch (e) {
    // ignora duplicadas
  }
}

})();

export default dbPromise;
