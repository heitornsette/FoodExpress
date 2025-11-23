document.addEventListener('DOMContentLoaded', async () => {
  let restRaw = localStorage.getItem('fe_selected_restaurant');

  const qs = new URLSearchParams(window.location.search);
  const idFromQs = qs.get('id');

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

  if (!restRaw) {
    console.warn('Nenhum restaurante selecionado — redirecionando para lista.');
    const gridWarn = document.querySelector('#cardapio .menu-grid') || document.querySelector('.menu-grid');
    if (gridWarn) gridWarn.innerHTML = '<p>Nenhum restaurante selecionado. Volte à lista de restaurantes.</p>';
    return;
  }

  const rest = JSON.parse(restRaw);
  const restNameEl = document.querySelector('.rest-name');
  if (restNameEl) restNameEl.textContent = rest.nome || restNameEl.textContent;

  const catEl = document.querySelector('.categoria-tag');
  if (catEl && rest.cozinha) catEl.textContent = rest.cozinha;

  const descricaoEl = document.querySelector('.descricao');
  if (descricaoEl && rest.descricao) descricaoEl.textContent = rest.descricao;

  let grid = document.querySelector('#cardapio .menu-grid');
  if (!grid) grid = document.querySelector('.menu-grid');

  if (!grid) {
    console.error('menu-grid não encontrado na página.');
    return;
  }

  grid.innerHTML = '<p>Carregando itens do cardápio...</p>';

  try {
    const res = await fetch(`http://localhost:3000/api/restaurants/${rest.id_restaurante}/items`);
    if (!res.ok) throw new Error('Erro HTTP ' + res.status);
    const body = await res.json();
    const items = body.items || [];

    if (!items.length) {
      grid.innerHTML = '<p>Este restaurante ainda não possui itens no cardápio.</p>';
      return;
    }

    grid.innerHTML = '';

    items.forEach(item => {
      const preco = parseFloat(item.preco || item.price || 0) || 0;

      const art = document.createElement('article');
      art.className = 'menu-item';

      art.innerHTML = `
        <img src="../imagens/generica.png" alt="${escapeHtml(item.nome)}" class="item-thumb">
        <div class="item-body">
          <h3 class="item-name">${escapeHtml(item.nome)}</h3>
          <p class="item-desc">${escapeHtml(item.descricao)}</p>
        </div>
        <div class="item-meta">
          <div class="item-price">R$ ${preco.toFixed(2)}</div>
          <div class="item-actions">
            <button class="btn-primario btn-sm" data-add="${item.id_item_restaurante || item.id_item || ''}">Adicionar</button>
          </div>
        </div>
      `;

        const addBtn = art.querySelector('button[data-add]');
        addBtn?.addEventListener('click', () => {
        const price = parseFloat(item.preco || item.price || 0) || 0;
        window.cart.addItem({
            id_item: item.id_item_restaurante || item.id_item,
            nome: item.nome,
            preco: price,
            qty: 1
        });
        addBtn.textContent = 'Adicionado';
        setTimeout(()=> addBtn.textContent = 'Adicionar', 900);
        });

      grid.appendChild(art);
    });

  } catch (err) {
    console.error('Erro ao carregar itens:', err);
    grid.innerHTML = '<p>Erro ao carregar itens do cardápio.</p>';
  }
});

function addToCart(item) {
  try {
    const raw = localStorage.getItem('fe_cart');
    const cart = raw ? JSON.parse(raw) : [];
    cart.push(Object.assign({ qty: 1 }, item));
    localStorage.setItem('fe_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('Erro ao adicionar ao carrinho', e);
  }
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
