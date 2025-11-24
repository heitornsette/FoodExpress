document.addEventListener('DOMContentLoaded', async () => {
  let restRaw = localStorage.getItem('fe_selected_restaurant');

  const qs = new URLSearchParams(window.location.search);
  const idFromQs = qs.get('id');

  // Caso venha via URL
  if (!restRaw && idFromQs) {
    try {
      const rRes = await fetch(`http://localhost:3000/api/restaurants/${idFromQs}`);
      if (rRes.ok) {
        const rBody = await rRes.json().catch(()=>null);
        restRaw = JSON.stringify(rBody.restaurant || rBody);
        if (restRaw) localStorage.setItem('fe_selected_restaurant', restRaw);
      }
    } catch (e) { }
  }

  // Sem restaurante → erro
  if (!restRaw) {
    const gridWarn = document.querySelector('#cardapio .menu-grid');
    if (gridWarn) gridWarn.innerHTML = '<p>Nenhum restaurante selecionado.</p>';
    return;
  }

  const rest = JSON.parse(restRaw);

  let grid = document.querySelector('#cardapio .menu-grid');
  grid.innerHTML = '<p>Carregando itens do cardápio...</p>';

  try {
    const res = await fetch(`http://localhost:3000/api/restaurants/${rest.id_restaurante}/items`);
    const body = await res.json();
    const items = body.items || [];

    if (!items.length) {
      grid.innerHTML = '<p>Este restaurante ainda não possui itens no cardápio.</p>';
      return;
    }

    grid.innerHTML = '';

    items.forEach(item => {
      const preco = parseFloat(item.preco || 0);

      // backend sempre envia item.imagem OU substitui por imagem padrão
      const imgSrc = item.imagem ? `..${item.imagem}` : "../imagens/burger.png";

      const art = document.createElement('article');
      art.className = 'menu-item';

      art.innerHTML = `
        <img src="${imgSrc}" alt="${escapeHtml(item.nome)}" class="item-thumb">

        <div class="item-body">
          <h3 class="item-name">${escapeHtml(item.nome)}</h3>
        </div>

        <div class="item-meta">
          <div class="item-price">R$ ${preco.toFixed(2)}</div>
          <div class="item-actions">
            <button class="btn-primario btn-sm" data-add="${item.id_item_restaurante}">
              Adicionar
            </button>
          </div>
        </div>
      `;

      const addBtn = art.querySelector('button[data-add]');

      addBtn.addEventListener('click', () => {
        window.cart.addItem({
          id_item: item.id_item_restaurante,
          nome: item.nome,
          preco: preco,
          qty: 1
        });

        addBtn.textContent = "Adicionado";
        setTimeout(()=> addBtn.textContent = "Adicionar", 900);
      });

      grid.appendChild(art);
    });

  } catch (err) {
    console.error("Erro ao carregar itens:", err);
    grid.innerHTML = '<p>Erro ao carregar itens.</p>';
  }
});

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
