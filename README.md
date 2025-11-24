# 🍔 FoodExpress

Sistema completo de delivery desenvolvido em **Node.js + Express + MySQL**, com frontend em **HTML, CSS e JavaScript puro**.  
Permite o gerenciamento de **usuários, restaurantes, itens do cardápio e pedidos**.

---

## 🚀 Tecnologias

### **Backend**
- Node.js  
- Express  
- MySQL 8+  
- mysql2/promise  
- JWT (autenticação)  
- Dotenv  

### **Frontend**
- HTML5  
- CSS3 (Poppins + Inter)  
- JavaScript ES6  
- Modais dinâmicos  
- LocalStorage  

---

## ⚙️ Como usar

### 1️⃣ Configurar o banco de dados

Execute o script SQL:

```
backend/database/foodexpress.sql
```

Isso criará todas as tabelas:

- Cliente  
- Restaurante  
- ItemRestaurante  
- Pedido  
- ItemPedido  

---

### 2️⃣ Configurar o arquivo `.env`

Crie o arquivo dentro de **backend/**:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua senha
DB_NAME=foodexpress
PORT=3000

JWT_SECRET=coloque_uma_chave_segura
JWT_EXPIRES=7d
```

---

### 3️⃣ Instalar dependências

```bash
cd backend
npm install
```

---

### 4️⃣ Executar o servidor

```bash
npm start
```

Servidor rodará em:

👉 http://localhost:3000

---

### 5️⃣ Rodar o frontend

Abra no navegador (ou use Live Server):

```
frontend/html/home.html
```

---

## 📦 Estrutura

```
foodexpress/
├── backend/
│   ├── app.js              # Servidor Express   
│   ├── src/db.js           # Conexão MySQL  
│   ├── routes/             # Rotas da API   
│   │   ├── auth.js
│   │   ├── restaurants.js
│   │   ├── items.js
│   │   └── pedidos.js
│   └── database/foodexpress.sql
│
├── frontend/
│   ├── css/                # Estilos   
│   ├── imagens/            # Imagens do projeto   
│   ├── js/                 # Scripts (login, carrinho, modais, pedidos...)   
│   └── html/
│       ├── home.html
│       ├── lista-restaurantes.html
│       ├── restaurante.html
│       ├── restaurante-edit.html
│       ├── user.html
│       └── modals/         # Todos os modais do sistema   
│
├── package.json
└── README.md
```

---

## 💡 Funcionalidades

### **Usuários**
✅ Criar conta  
✅ Login  
✅ Editar dados  
✅ Ver pedidos  
✅ Repetir pedidos  
✅ Carrinho funcional  
✅ Finalizar pedido  

### **Restaurantes**
✅ Login do restaurante  
✅ Painel administrativo  
✅ Criar / editar / excluir itens  
✅ Atualizar status dos pedidos  
   (Em preparo → A caminho → Entregue)  

### **Admin**
✅ Criar restaurante via modal exclusivo  

---

## 🔌 Rotas principais da API

### **Autenticação**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/signup | Criar cliente |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Dados do usuário |
| PUT | /api/auth/me | Atualizar conta |
| DELETE | /api/auth/me | Excluir conta |

---

### **Restaurantes**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/restaurants | Listar restaurantes |
| POST | /api/restaurants | Criar restaurante |
| POST | /api/restaurants/login | Login |
| GET | /api/restaurants/:id | Ver restaurante |
| PUT | /api/restaurants/:id | Editar restaurante |
| DELETE | /api/restaurants/:id | Remover restaurante |

---

### **Itens**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/restaurants/:id/items | Itens do cardápio |
| POST | /api/restaurants/:id/items | Criar item |
| PUT | /api/items/:id | Editar item |
| DELETE | /api/items/:id | Apagar item |

---

### **Pedidos**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/pedidos | Criar pedido |
| GET | /api/pedidos | Listar pedidos |
| PUT | /api/pedidos/:id/status | Avançar status |

---

## 👨‍💻 Autor

**Heitor Sette**  
Estudante de Ciência da Computação – UNIFOR  

📧 heitorsette.dev@gmail.com

---

© 2025 FoodExpress — Projeto educacional.
