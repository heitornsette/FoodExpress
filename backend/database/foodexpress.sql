CREATE DATABASE IF NOT EXISTS FoodExpress;
use FoodExpress;

CREATE TABLE IF NOT EXISTS Cliente (
	id_cliente INT AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(100) NOT NULL UNIQUE,
    endereco VARCHAR(255)NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Restaurante (
	id_restaurante INT AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
    cozinha VARCHAR(100) NOT NULL,
    telefone VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pedido (
	id_pedido INT AUTO_INCREMENT PRIMARY KEY,
	id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    horario DATETIME NOT NULL,
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

CREATE TABLE IF NOT EXISTS ItemRestaurante (
    id_item_restaurante INT AUTO_INCREMENT PRIMARY KEY,
    id_restaurante INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_rest_restaurante FOREIGN KEY (id_restaurante) REFERENCES Restaurante(id_restaurante) ON DELETE CASCADE
);

INSERT INTO Cliente (nome, email, senha, telefone, endereco, is_admin) VALUES
('Heitor Sette', 'heitor@teste.com', '123456', '85999990001', 'Rua Alfa, 123 - Fortaleza', FALSE),
('Ana Paula', 'ana.paula@mail.com', '123456', '85999990002', 'Rua Beta, 200 - Fortaleza', FALSE),
('Carlos Lima', 'carlos.lima@mail.com', '123456', '85999990003', 'Av. Central, 500 - Eusébio', FALSE),
('Marina Souza', 'marina.souza@mail.com', '123456', '85999990004', 'Rua das Flores, 45 - Caucaia', FALSE),
('Admin', 'admin@admin.com', 'admin123', '85999990005', 'Sede FoodExpress - Fortaleza', TRUE);

INSERT INTO Restaurante (nome, cozinha, telefone, senha) VALUES
('Sabor Nordestino', 'Regional', '85988880001', '123456'),
('La Pasta', 'Italiana', '85988880002', '123456'),
('Sushi Max', 'Japonesa', '85988880003', '123456'),
('Burger House', 'Hamburgueria', '85988880004', '123456'),
('Veggie Life', 'Vegetariana', '85988880005', '123456');

INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES
(1, 'Baião de Dois', 22.90),
(1, 'Carne de Sol', 29.90),
(1, 'Paçoca Nordestina', 18.50);
INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES
(2, 'Spaghetti Carbonara', 32.90),
(2, 'Lasagna Bolonhesa', 38.00),
(2, 'Ravioli 4 Queijos', 35.90);
INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES
(3, 'Sushi Combo 12 Peças', 42.00),
(3, 'Temaki de Salmão', 22.00),
(3, 'Hot Roll 8 Peças', 18.90);
INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES
(4, 'Burger Clássico', 24.90),
(4, 'Cheddar Bacon', 29.90),
(4, 'Batata Especial', 16.50);
INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES
(5, 'Salada Green Power', 19.90),
(5, 'Burger Vegano', 27.90),
(5, 'Quinoa Bowl', 23.90);


SELECT * FROM Cliente;
SELECT * FROM ItemRestaurante;
SELECT * FROM Restaurante;
SELECT * FROM Pedido;
SELECT * FROM ItemPedido;