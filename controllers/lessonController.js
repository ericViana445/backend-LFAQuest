// controllers/lessonController.js
import dbPromise from "../db.js";

/**
 * Função auxiliar: calcula a diferença de dias entre duas datas (sem fuso horário)
 */
function getDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Zera as horas para evitar erro de timezone
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const completeLesson = async (req, res) => {
  try {
    const { user_id, correct_answers, total_questions, questions } = req.body;
    const db = await dbPromise;

    // Verifica se o usuário existe
    const user = await db.get("SELECT * FROM users WHERE id = ?", [user_id]);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    // ===============================
    // 1️⃣ Calcula XP e diamantes
    // ===============================
    const xpEarned = correct_answers * 10;      // 10 XP por acerto
    const diamondsEarned = correct_answers * 2; // 2 diamantes por acerto

    // ===============================
    // 2️⃣ Lógica da Ofensiva (Streak)
    // ===============================
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastCompleted = user.last_completed_date;
    let streakCount = user.streak_count || 0;

    if (lastCompleted) {
      const diffDays = getDaysDiff(today, lastCompleted);

      if (diffDays === 0) {
        streakCount = user.streak_count;
      } else if (diffDays === 1) {
        streakCount = user.streak_count + 1;
      } else {
        streakCount = 1;
      }
    } else {
      streakCount = 1;
    }

    // ===============================
    // 3️⃣ Atualiza o banco do usuário
    // ===============================
    await db.run(
      `UPDATE users 
       SET xp = xp + ?, 
           diamonds = diamonds + ?, 
           streak_count = ?, 
           last_completed_date = ? 
       WHERE id = ?`,
      [xpEarned, diamondsEarned, streakCount, today, user_id]
    );

    // ===============================
    // 4️⃣ Salva respostas na tabela user_questions
    // ===============================
    if (Array.isArray(questions)) {
      for (const q of questions) {
        const { questionId, tags, isCorrect, timeTaken } = q;
        await db.run(
          `INSERT INTO user_questions (user_id, question_id, tags, is_correct, time_taken)
           VALUES (?, ?, ?, ?, ?)`,
          [
            user_id,
            questionId,
            JSON.stringify(tags || []),
            isCorrect ? 1 : 0,
            timeTaken || 0
          ]
        );
      }
    }

    // ===============================
    // 5️⃣ Busca valores atualizados
    // ===============================
    const updated = await db.get(
      "SELECT xp, diamonds, streak_count FROM users WHERE id = ?",
      [user_id]
    );

    // ===============================
    // 6️⃣ Retorna resposta para o frontend
    // ===============================
    res.json({
      message: "Lição concluída com sucesso!",
      xp_earned: xpEarned,
      diamonds_earned: diamondsEarned,
      new_xp: updated.xp,
      new_diamonds: updated.diamonds,
      new_streak: updated.streak_count
    });
  } catch (err) {
    console.error("❌ Erro no completeLesson:", err);
    res.status(500).json({ error: err.message });
  }
};

