// controllers/storeController.js
import dbPromise from "../db.js";

// 🔹 Registrar compra de item
export const purchaseItem = async (req, res) => {
  try {
    const { user_id, item_name, type, cost } = req.body;
    const db = await dbPromise;

    // 1️⃣ Verifica se usuário existe
    const user = await db.get("SELECT * FROM users WHERE id = ?", [user_id]);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    // 2️⃣ Verifica se já comprou o item
    const existing = await db.get(
      "SELECT * FROM purchases WHERE user_id = ? AND item_name = ?",
      [user_id, item_name]
    );
    if (existing)
      return res.status(400).json({ message: "Item já foi comprado anteriormente" });

    // 3️⃣ Verifica saldo
    if (user.diamonds < cost)
      return res.status(400).json({ message: "Diamantes insuficientes" });

    // 4️⃣ Atualiza saldo
    const newBalance = user.diamonds - cost;
    await db.run("UPDATE users SET diamonds = ? WHERE id = ?", [newBalance, user_id]);

    // 5️⃣ Registra compra
    await db.run(
      "INSERT INTO purchases (user_id, item_name, type, cost) VALUES (?, ?, ?, ?)",
      [user_id, item_name, type, cost]
    );

    // 6️⃣ Retorna resposta
    res.json({
      message: "Compra realizada com sucesso!",
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("❌ Erro ao comprar item:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Buscar compras de um usuário
export const getUserPurchases = async (req, res) => {
  try {
    const { user_id } = req.params;
    const db = await dbPromise;

    const purchases = await db.all(
      "SELECT item_name, type FROM purchases WHERE user_id = ?",
      [user_id]
    );

    res.json(purchases);
  } catch (err) {
    console.error("❌ Erro ao buscar compras:", err);
    res.status(500).json({ error: err.message });
  }
};
