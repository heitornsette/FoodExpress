CREATE DATABASE IF NOT EXISTS FoodExpress;
use FoodExpress;

CREATE TABLE IF NOT EXISTS Cliente (
	id_cliente INT AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	senha VARCHAR(100) NOT NULL,
	telefone VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Restaurante (
	id_restaurante INT AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
    cozinha VARCHAR(100) NOT NULL,
    telefone VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pedido (
	id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    horario DATETIME NOT NULL,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    status ENUM('Em preparo','A caminho','Entregue') NOT NULL DEFAULT 'Em preparo',
    CONSTRAINT fk_id_cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_id_restaurante FOREIGN KEY (id_restaurante) REFERENCES Restaurante(id_restaurante) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ItemPedido (
	id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
	CONSTRAINT fk_id_pedido FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE
);