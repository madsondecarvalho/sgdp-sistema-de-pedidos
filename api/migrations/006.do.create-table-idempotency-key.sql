CREATE TABLE pedidos_idempotency (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  pedido_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);