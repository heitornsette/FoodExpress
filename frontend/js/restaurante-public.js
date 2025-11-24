(async function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.error("Nenhum ID encontrado na URL.");
        return;
    }

    try {
        const resRest = await fetch(`http://localhost:3000/api/restaurants/${id}`);
        const dataRest = await resRest.json();

        if (!dataRest.restaurant) {
            console.error("Restaurante não encontrado.");
            return;
        }

        const r = dataRest.restaurant;

        document.querySelector(".rest-name").textContent = r.nome;
        document.querySelector(".categoria-tag").textContent = r.cozinha;
        document.querySelector(".descricao").textContent = `${r.nome} — especializado em ${r.cozinha}.`;

        const telDiv = document.querySelector(".info-adicional div:nth-child(3)");
        if (telDiv) {
            telDiv.innerHTML = `<strong>Telefone:</strong> ${r.telefone}`;
        }

        document.querySelector(".hero-imagem img").src = "../imagens/generica.png";

        const resItens = await fetch(`http://localhost:3000/api/restaurants/${id}/items`);
        const dataItens = await resItens.json();

        const grid = document.querySelector(".menu-grid");
        grid.innerHTML = "";

        if (!dataItens.items.length) {
            grid.innerHTML = "<p class='muted'>Nenhum item cadastrado.</p>";
            return;
        }

        dataItens.items.forEach(item => {
            const card = `
                <article class="menu-item">
                    <img src="../imagens/generica.png" class="item-thumb">
                    <div class="item-body">
                        <h3 class="item-name">${item.nome}</h3>
                        <p class="item-desc">${item.descricao || 'Item delicioso do cardápio'}</p>
                    </div>
                    <div class="item-meta">
                        <div class="item-price">R$ ${item.preco}</div>
                        <div class="item-actions">
                            <button class="btn-secundario btn-sm">-</button>
                            <button class="btn-primario btn-sm">Adicionar</button>
                        </div>
                    </div>
                </article>
            `;

            grid.insertAdjacentHTML("beforeend", card);
        });

    } catch (err) {
        console.error("Erro ao carregar restaurante:", err);
    }
})();