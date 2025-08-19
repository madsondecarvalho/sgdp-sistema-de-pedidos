module.exports = {
  migrationDirectory: './migrations',
  driver: 'mysql', 
  host: 'localhost',
  port: 3306,
  database: 'pedidos_service',
  username: 'znap_user',
  password: 'znap_password',
  // Compatibilidade para MySQL 8
  schemaTable: 'postgrator_migrations'
};