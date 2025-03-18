require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
   });
   connection.query(`CREATE DATABASE IF NOT EXISTS
   \`${process.env.DB_NAME}\`;`, (err) => {
    if (err) throw err;
    console.log(`Banco de dados '${process.env.DB_NAME}' garantido.`);
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL.');
    });
    const CREATE_TABLE_QUERY = `
    CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
    )`;
    connection.query(CREATE_TABLE_QUERY, (err) => {
    if (err) throw err;
    console.log('Tabela users garantida.');
    });
   });

   // Criar usuário
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const INSERT_USER_QUERY = `INSERT INTO users (name, email) VALUES
   (?, ?)`;
    connection.query(INSERT_USER_QUERY, [name, email], (err, results) =>
   {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuário criado com sucesso', id:
   results.insertId });
    });
   });
   // Obter todos os usuários
   app.get('/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
   });
   app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
   });
      
   //Obter usuario por id

   app.get('/users/:id', (req, res) => { // Corrigido a rota para ter o `:` antes do `id`
    const { id } = req.params;
    connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) { // Corrigido o erro de sintaxe aqui
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(results[0]);
    });
});

  // atualizar usuario
   app.put('/users/:id', (req, res) => {
    const {id} = req.params;
    const {name, email} = req.body;
    const UPDATE_USER_QUERY = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    connection.query(UPDATE_USER_QUERY, [name, email, id], (err, results) => {
        if (err) return res.status(500).json({error: err.message});
        if (results.affectedRows === 0){
            return res.status(404).json({error: 'Ususario não encontrado'}); 
        }
   
    res.json({ message: 'usuario atualizao com sucesso' });
       });
   });

   app.delete('/users/:id', (req, res) => {
    const {id} = req.params;
    const DELETE_USER_QUERY = 'DELETE FROM users WHERE id = ?';
    connection.query(DELETE_USER_QUERY, [id], (err, results) => {
        if (err) return res.status(500).json({error: err.message});
        if (results.affectedRows === 0){
            return res.status(404).json({error: 'Ususario não encontrado'}); 
        }
   
    res.json({ message: 'usuario deletado com sucesso' });
       });
   });

   const server=app.listen(port, () => {
    console.log('Servidor rodando com sucesso, $(port)');
   });

   module.exports(app, connection, server);


  