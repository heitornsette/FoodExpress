document.addEventListener("DOMContentLoaded", loadRestaurantItems);

async function loadRestaurantItems() {
  const restData = localStorage.getItem("fe_restaurant");
  if (!restData) {
    alert("Erro: restaurante não encontrado.");
    return;
  }

  const rest = JSON.parse(restData);
  const grid = document.getElementById("menuGrid");

  try {
    const res = await fetch(`http://localhost:3000/api/restaurants/${rest.id_restaurante}/items`);
    const data = await res.json();

    if (!data.items.length) {
      grid.innerHTML = "<p>Nenhum item cadastrado ainda.</p>";
      return;
    }

    grid.innerHTML = "";

    data.items.forEach(item => {
      const card = document.createElement("article");
      card.classList.add("menu-item");

      card.innerHTML = `
        <img src="../imagens/generica.png" class="item-thumb">

        <div class="item-body">
          <h3 class="item-name">${item.nome}</h3>
          <p class="item-desc">${item.descricao}</p>
        </div>

        <div class="item-meta">
          <div class="item-price">R$ ${Number(item.preco).toFixed(2)}</div>
          <div class="item-actions">
            <button class="btn-secundario" onclick="editItem(${item.id_item_restaurante})">Editar</button>
            <button class="btn-secundario" onclick="deleteItem(${item.id_item_restaurante})">Remover</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Erro ao carregar itens.</p>";
  }
}

async function editItem(id) {
  const newName = prompt("Novo nome do item:");
  if (!newName) return;

  const newDesc = prompt("Nova descrição:");
  if (!newDesc) return;

  const newPrice = prompt("Novo preço:");
  if (!newPrice) return;

  const res = await fetch(`http://localhost:3000/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: newName,
      descricao: newDesc,
      preco: parseFloat(newPrice),
      categoria: ""
    })
  });

  if (!res.ok) {
    alert("Erro ao atualizar item.");
    return;
  }

  alert("Item atualizado!");
  loadRestaurantItems();
}

async function deleteItem(id) {
  if (!confirm("Tem certeza que deseja remover este item?")) return;

  const res = await fetch(`http://localhost:3000/api/items/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Erro ao remover item.");
    return;
  }

  alert("Item removido!");
  loadRestaurantItems();
}
