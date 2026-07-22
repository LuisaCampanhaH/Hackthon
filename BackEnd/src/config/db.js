const { Pool } = require('pg');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// Configura a conexão usando as variáveis do .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Testa a conexão para avisar no terminal se deu certo
pool.connect((err, client, release) =>
{
  if (err)
  {
    return console.error('❌ Erro ao conectar ao PostgreSQL:', err.stack);
  }
  
  console.log('🚀 Conexão com o PostgreSQL (remedios_db) estabelecida com sucesso!');
  release();

});

module.exports = {
  query: (text, params) => pool.query(text, params),
};