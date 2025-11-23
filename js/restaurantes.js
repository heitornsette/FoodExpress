document.addEventListener("DOMContentLoaded", loadRestaurants);

async function loadRestaurants() {
  const grid = document.querySelector(".restaurants-grid");

  grid.innerHTML = "<p>Carregando restaurantes...</p>";

  try {
    const res = await fetch("http://127.0.0.1:3000/api/restaurants");
    if (!res.ok) throw new Error("Erro HTTP " + res.status);

    const data = await res.json();
    const restaurants = data.restaurants;

    if (!restaurants.length) {
      grid.innerHTML = "<p>Nenhum restaurante encontrado.</p>";
      return;
    }

    grid.innerHTML = "";

    restaurants.forEach(r => {
      const card = document.createElement("div");
      card.classList.add("restaurant-card");

      card.innerHTML = `
        <div class="card-img">
          <img src="../imagens/generica.png" alt="${r.nome}">
        </div>

        <div class="card-info">
          <h3>${r.nome}</h3>
          <p class="cozinha">${r.cozinha}</p>
          <p class="telefone">☎ ${r.telefone}</p>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Erro ao carregar restaurantes.</p>";
  }
}
