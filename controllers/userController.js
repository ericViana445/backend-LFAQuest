// Backend/controllers/userController.js
import dbPromise from "../db.js";

// 📘 Obtém o perfil do usuário
export const getUserProfile = async (req, res) => {
  try {
    const db = await dbPromise;
    const user = await db.get(
      `SELECT 
         id, 
         name, 
         email, 
         xp, 
         diamonds, 
         streak_count, 
         last_completed_date,
         selected_avatar,
         selected_background
       FROM users 
       WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Erro ao buscar perfil:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🏆 Retorna todos os usuários ordenados por XP (ranking global)
export const getLeaderboard = async (req, res) => {
  try {
    const db = await dbPromise;
    const users = await db.all(`
      SELECT 
        id, 
        name, 
        xp, 
        diamonds, 
        streak_count, 
        selected_avatar
      FROM users
      ORDER BY xp DESC
    `);
    res.json(users);
  } catch (err) {
    console.error("❌ Erro ao buscar leaderboard:", err);
    res.status(500).json({ error: err.message });
  }
};


// ⚡ Atualiza o XP do usuário
export const updateUserXP = async (req, res) => {
  try {
    const { xp } = req.body;
    const db = await dbPromise;

    await db.run("UPDATE users SET xp = ? WHERE id = ?", [xp, req.params.id]);
    res.json({ message: "XP atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🎨 Atualiza avatar e fundo do usuário
export const updateUserPreferences = async (req, res) => {
  try {
    const { selected_avatar, selected_background } = req.body;
    const db = await dbPromise;

    const result = await db.run(
      "UPDATE users SET selected_avatar = ?, selected_background = ? WHERE id = ?",
      [selected_avatar, selected_background, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const updated = await db.get(
      "SELECT id, name, email, selected_avatar, selected_background FROM users WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Preferências atualizadas com sucesso!",
      user: updated,
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar preferências:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🎖️ Retorna todas as conquistas (com status desbloqueado/bloqueado)
export const getUserAchievements = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;

    const allAchievements = await db.all(`SELECT * FROM achievements`);
    const userAchievements = await db.all(
      `SELECT achievement_id FROM user_achievements WHERE user_id = ?`,
      [id]
    );

    const unlockedIds = userAchievements.map((a) => a.achievement_id);

    const result = allAchievements.map((a) => ({
      ...a,
      unlocked: unlockedIds.includes(a.id),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Erro ao buscar conquistas:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🧠 Verifica e desbloqueia conquistas do usuário
export const checkAchievements = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;

    // Busca progresso do usuário
    const user = await db.get(
      `SELECT xp, streak_count FROM users WHERE id = ?`,
      [id]
    );

    // Conta compras feitas
    const purchases = await db.all(
      `SELECT COUNT(*) as total FROM purchases WHERE user_id = ?`,
      [id]
    );
    const purchaseCount = purchases[0]?.total ?? 0;

    // Busca conquistas existentes
    const allAchievements = await db.all(`SELECT * FROM achievements`);
    const unlocked = await db.all(
      `SELECT achievement_id FROM user_achievements WHERE user_id = ?`,
      [id]
    );
    const unlockedIds = unlocked.map((a) => a.achievement_id);

    const newlyUnlocked = [];

    for (const a of allAchievements) {
      if (unlockedIds.includes(a.id)) continue; // já desbloqueada

      let condition = false;
      if (a.requirement_type === "xp" && user.xp >= a.requirement_value)
        condition = true;
      if (a.requirement_type === "streak" && user.streak_count >= a.requirement_value)
        condition = true;
      if (a.requirement_type === "purchase_count" && purchaseCount >= a.requirement_value)
        condition = true;

      if (condition) {
        await db.run(
          `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`,
          [id, a.id]
        );
        newlyUnlocked.push(a);
      }
    }

    res.json({ newAchievements: newlyUnlocked });
  } catch (err) {
    console.error("❌ Erro ao checar conquistas:", err);
    res.status(500).json({ error: err.message });
  }
};

export const saveDiagnosticAnswers = async (req, res) => {
  try {
    const db = await dbPromise;
    const { user_id, answers } = req.body;

    for (const ans of answers) {
      await db.run(
        `INSERT INTO diagnostic_answers (user_id, question, answer, correct_answer)
         VALUES (?, ?, ?, ?)`,
        [user_id || null, ans.question, ans.answer, ans.correct_answer]
      );
    }

    res.json({ message: "Respostas do diagnóstico salvas com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao salvar diagnóstico:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔓 Atualiza fases desbloqueadas do usuário
export const updateUnlockedPhases = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { unlocked_phases } = req.body; // array ex: ["1", "2"]

    await db.run(
      "UPDATE users SET unlocked_phases = ? WHERE id = ?",
      [JSON.stringify(unlocked_phases), id]
    );

    res.json({ message: "Progresso de fases atualizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar fases desbloqueadas:", err);
    res.status(500).json({ error: err.message });
  }
};
