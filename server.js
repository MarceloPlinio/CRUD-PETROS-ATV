const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());

// Conecta ao banco de dados SQLite 
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  // Cria a tabela de produtos
  db.run("CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)");
});

// CREATE (POST) - Rota para adicionar um novo produto
app.post("/api/produtos", (req, res) => {
  const { nome, preco } = req.body;
  db.run("INSERT INTO produtos (nome, preco) VALUES (?, ?)", [nome, preco], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, nome, preco });
  });
});

// READ (GET) - Rota para buscar todos os produtos
app.get("/api/produtos", (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// READ (GET) - Rota para buscar um produto por ID
app.get("/api/produtos/:id", (req, res) => {
  db.get("SELECT * FROM produtos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).send("Produto não encontrado");
    }
  });
});

// UPDATE (PUT) - Rota para atualizar um produto
app.put("/api/produtos/:id", (req, res) => {
  const { nome, preco } = req.body;
  db.run("UPDATE produtos SET nome = ?, preco = ? WHERE id = ?", [nome, preco, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).send("Produto não encontrado para atualização");
    }
    res.send("Produto atualizado");
  });
});

// DELETE (DELETE) - Rota para remover um produto
app.delete("/api/produtos/:id", (req, res) => {
  db.run("DELETE FROM produtos WHERE id = ?", req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).send("Produto não encontrado para deletar");
    }
    res.send("Produto deletado");
  });
});

// Inicializa o servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));