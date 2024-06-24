const { Pool } = require('pg');

const pool = new Pool({
  user: 'medali',          // Remplacez par votre nom d'utilisateur PostgreSQL
  host: 'localhost',       // L'hôte de votre base de données
  database: 'babyfoot',    // Le nom de votre base de données
  password: 'medali', // Remplacez par le mot de passe de votre utilisateur PostgreSQL
  port: 5432,              // Le port sur lequel votre base de données est en cours d'exécution
});

module.exports = pool;
