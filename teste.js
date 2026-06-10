// src/usuarios.js — EXEMPLO COM FALHAS PROPOSITAIS (não usar em produção!)

const mysql = require('mysql');
const express = require('express');
const router = express.Router();

// ❌ Credenciais hardcoded no código
const DB_HOST = 'prod-server.empresa.com.br';
const DB_USER = 'root';
const DB_PASS = 'Senha@2024!';
const SECRET_KEY = 'minha_chave_jwt_super_secreta';
const SECRET_KEY_2 = 'minha_chave_jwt_super_secreta';
const CHAVE_DO_BANCO = 'Senha@2024!';

const conn = mysql.createConnection({
  host: DB_HOST, user: DB_USER, password: DB_PASS, database: 'sistema'
});

// ❌ SQL Injection — concatenação direta com input do usuário
router.post('/login', function(req, res) {
  var usuario = req.body.usuario;
  var senha = req.body.senha;

  var query = "SELECT * FROM usuarios WHERE usuario = '" + usuario + "' AND senha = '" + senha + "'";
  conn.query(query, function(err, result) {
    if (result.length > 0) {
      // ❌ Token fraco — só base64, sem assinatura
      var token = Buffer.from(usuario + ':admin').toString('base64');
      res.send({ token: token, admin: true });
    } else {
      // ❌ Vaza mensagem de erro interno para o cliente
      res.send({ error: err.toString() });
    }
  });
});

// ❌ SQL Injection via query string
router.get('/usuario', function(req, res) {
  var id = req.query.id;
  conn.query('SELECT * FROM usuarios WHERE id = ' + id, function(err, rows) {
    res.send(rows);
  });
});

// ❌ Path Traversal — filename pode ser "../../../etc/passwd"
router.post('/upload', function(req, res) {
  var filename = req.body.filename;
  var content = req.body.content;
  require('fs').writeFileSync('/uploads/' + filename, content);
  res.send('ok');
});

// ❌ Sem autenticação para deletar usuários
router.delete('/usuario/:id', function(req, res) {
  conn.query('DELETE FROM usuarios WHERE id = ' + req.params.id);
  res.send('deletado');
});

// ❌ Remote Code Execution — executa qualquer comando do sistema via URL
router.get('/debug', function(req, res) {
  var cmd = req.query.cmd;
  require('child_process').exec(cmd, function(err, stdout) {
    res.send(stdout);
  });
});

module.exports = router;