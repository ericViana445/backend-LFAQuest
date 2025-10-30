// backend/controllers/userAnalyticsController.js
import dbPromise from "../db.js";

export const getUserAnalytics = async (req, res) => {
  console.log("📥 [getUserAnalytics] Requisição recebida!");

  try {
    const { id } = req.params; // id = user_id
    console.log("🔍 ID recebido:", id);

    const db = await dbPromise;
    console.log("🗄️ Banco de dados carregado com sucesso.");

    // Busca respostas do usuário
    const userQuestions = await db.all(
      "SELECT * FROM user_questions WHERE user_id = ?",
      [id]
    );

    console.log("📊 Resultado da query (user_questions):", userQuestions);

    if (!userQuestions || userQuestions.length === 0) {
      console.warn("⚠️ Nenhuma pergunta encontrada para este usuário.");
      return res.status(404).json({ message: "Nenhuma pergunta encontrada para este usuário." });
    }

    // Agrupa por tag
    const tagStats = {};
    console.log("🔧 Iniciando agrupamento de tags...");

    userQuestions.forEach(q => {
      const tags = JSON.parse(q.tags || "[]");
      tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { total: 0, correct: 0, incorrect: 0, totalTime: 0 };
        }

        tagStats[tag].total += 1;
        if (q.is_correct) tagStats[tag].correct += 1;
        else tagStats[tag].incorrect += 1;
        tagStats[tag].totalTime += q.time_taken || 0;
      });
    });

    console.log("📈 tagStats final:", tagStats);

    // Calcula métricas por tag
    const tagAnalytics = Object.entries(tagStats).map(([tag, data]) => ({
      tag,
      total_questions: data.total,
      correct: data.correct,
      incorrect: data.incorrect,
      accuracy: data.total > 0 ? parseFloat((data.correct / data.total).toFixed(2)) : 0,
      avg_time: data.total > 0 ? parseFloat((data.totalTime / data.total).toFixed(2)) : 0,
    }));

    console.log("🧮 tagAnalytics calculado:", tagAnalytics);

    // Tag com mais erros
    const tagMostErrors = tagAnalytics.reduce((prev, curr) =>
      curr.incorrect > prev.incorrect ? curr : prev,
      { incorrect: -1 }
    );

    // Estatísticas gerais
    const totalQuestions = userQuestions.length;
    const totalCorrect = userQuestions.filter(q => q.is_correct).length;
    const totalIncorrect = totalQuestions - totalCorrect;

    console.log("📊 Estatísticas gerais:", {
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      tagMostErrors: tagMostErrors.tag,
    });

    const response = {
      total_questions: totalQuestions,
      total_correct: totalCorrect,
      total_incorrect: totalIncorrect,
      tag_most_errors: tagMostErrors.tag || null,
      tags: tagAnalytics,
    };

    console.log("✅ Enviando resposta JSON:", response);
    res.json(response);

  } catch (err) {
    console.error("❌ Erro no getUserAnalytics:", err);
    res.status(500).json({ error: err.message });
  }
};
