require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

// Determine if we're in test mode
const isTestEnvironment = process.env.NODE_ENV === 'test';

module.exports = {
  migrationDirectory: './migrations',
  driver: 'mysql',
  
  // Use test-specific variables when in test environment
  host: isTestEnvironment 
    ? (process.env.DB_HOST_TEST || 'mysql_test')
    : (process.env.DB_HOST || 'mysql'),
    
  port: isTestEnvironment
    ? parseInt(process.env.DB_PORT_TEST || '3306')
    : parseInt(process.env.DB_PORT || '3306'),
    
  database: isTestEnvironment
    ? (process.env.DB_DATABASE_TEST || 'pedidos_service_test')
    : (process.env.DB_DATABASE || 'pedidos_service'),
    
  username: isTestEnvironment
    ? (process.env.DB_USER_TEST || 'test_user')
    : (process.env.DB_USER || 'znap_user'),
    
  password: isTestEnvironment
    ? (process.env.DB_PASSWORD_TEST || 'test_password')
    : (process.env.DB_PASSWORD || 'znap_password'),
    
  schemaTable: 'migrations',
  // Add a connection timeout to wait for MySQL to be ready
  connectionTimeout: 30000
};