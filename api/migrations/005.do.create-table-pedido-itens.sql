CREATE TABLE pedido_itens (
    id_pedido CHAR(36) NOT NULL,
    id_produto CHAR(36) NOT NULL,
    qtde INT UNSIGNED NOT NULL,
    preco BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_pedido, id_produto),

    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    FOREIGN KEY (id_produto) REFERENCES produtos(id)
);