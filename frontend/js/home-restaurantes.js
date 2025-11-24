(async function carregarRestaurantesPopulares() {
    try {
        const res = await fetch("http://localhost:3000/api/restaurants");
        const data = await res.json();

        if (!data.restaurants || data.restaurants.length === 0) {
            console.warn("Nenhum restaurante encontrado.");
            return;
        }

        const grid = document.querySelector(".restaurantes-grid");
        if (!grid) {
            console.error("Elemento .restaurantes-grid não encontrado.");
            return;
        }

        grid.innerHTML = "";

        const primeirosQuatro = data.restaurants.slice(0, 4);

        primeirosQuatro.forEach((rest, index) => {
            const link = document.createElement('a');
            link.className = 'restaurante-card';
            link.href = `../html/restaurante.html?id=${rest.id_restaurante}`;
            link.setAttribute('data-id', rest.id_restaurante);

            link.innerHTML = `
                <img src="../imagens/restaurant-${(index % 4) + 1}.jpg" alt="Imagem restaurante">

                <div class="info">
                    <span class="categoria">${rest.cozinha}</span>
                    <h3>${escapeHtml(rest.nome)}</h3>

                    <div class="avaliacao">
                        <span class="nota">4.${rest.id_restaurante}</span>
                        <span class="tempo">20-40 min</span>
                    </div>

                    <div class="preco">$$</div>
                </div>
            `;

            link.addEventListener('click', function (e) {
                e.preventDefault();

                try {
                    const payload = {
                        id_restaurante: rest.id_restaurante,
                        nome: rest.nome,
                        cozinha: rest.cozinha,
                        telefone: rest.telefone,
                        descricao: rest.descricao || '',
                        endereco: rest.endereco || ''
                    };
                    localStorage.setItem('fe_selected_restaurant', JSON.stringify(payload));
                } catch (err) {
                    console.warn('Erro ao salvar fe_selected_restaurant:', err);
                }

                window.location.href = this.href;
            });

            grid.appendChild(link);
        });

    } catch (err) {
        console.error("Erro ao carregar restaurantes populares:", err);
    }
})();

function escapeHtml(s){ if(!s&&s!==0) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }