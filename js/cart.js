(function(){
  const CART_KEY = "fe_cart";
  const PANEL_ID = "feCartPanel";

  function getCart(){ try{ const r = localStorage.getItem(CART_KEY); return r ? JSON.parse(r) : []; }catch(e){return[];} }
  function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateHeaderCount(); }
  function cartTotal(){ return getCart().reduce((s,it)=> s + (parseFloat(it.preco||0)||0) * (parseInt(it.qty||1)||1), 0); }

  function addItem(item){
    const cart = getCart();
    const idx = cart.findIndex(x=>x.id_item === item.id_item);
    if(idx>=0){ cart[idx].qty = (cart[idx].qty||1) + (item.qty||1); }
    else cart.push(Object.assign({qty: item.qty||1}, item));
    saveCart(cart);
    renderPanel();
  }

  function setQty(id_item, qty){
    const cart = getCart(); const i = cart.findIndex(x=>x.id_item===id_item);
    if(i<0) return;
    if(qty<=0) cart.splice(i,1); else cart[i].qty = qty;
    saveCart(cart); renderPanel();
  }

  function removeItem(id_item){ const cart = getCart().filter(x=>x.id_item!==id_item); saveCart(cart); renderPanel(); }
  function clearCart(){ localStorage.removeItem(CART_KEY); renderPanel(); }

  function ensurePanel(){
    let el = document.getElementById(PANEL_ID);
    if(el) return el;

    el = document.createElement('aside');
    el.id = PANEL_ID;
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <div class="cart-header">
        <h3>Carrinho</h3>
        <div>
          <button id="feCartCloseBtn" class="btn-secundario btn-sm">Fechar</button>
        </div>
      </div>
      <div class="cart-items" id="feCartItems"></div>
      <div class="cart-footer">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong>Total</strong><strong id="feCartTotal">R$ 0.00</strong>
        </div>
        <button id="feCartCheckoutBtn" class="btn-primary full">Finalizar pedido</button>
        <button id="feCartClearBtn" class="btn-secundario full" style="margin-top:8px">Limpar carrinho</button>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('feCartCloseBtn').addEventListener('click', closeCartPanel);
    document.getElementById('feCartClearBtn').addEventListener('click', ()=>{ if(confirm('Limpar todo o carrinho?')) clearCart(); });
    document.getElementById('feCartCheckoutBtn').addEventListener('click', checkout);

    return el;
  }

  function openCartPanel(){
    const panel = ensurePanel();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    renderPanel();
  }

  function closeCartPanel(){
    const panel = document.getElementById(PANEL_ID);
    if(!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  }

  function formatPrice(v){ return 'R$ ' + (parseFloat(v||0).toFixed(2)); }

  function renderPanel(){
    const panel = ensurePanel();
    const itemsEl = panel.querySelector('#feCartItems');
    const totalEl = panel.querySelector('#feCartTotal');
    const cart = getCart();

    if(!cart.length){
      itemsEl.innerHTML = '<p>Seu carrinho está vazio.</p>';
      totalEl.textContent = formatPrice(0);
      updateHeaderCount();
      return;
    }

    itemsEl.innerHTML = '';
    cart.forEach(it=>{
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div style="width:64px"><img src="../imagens/generica.png" style="width:56px;height:56px;object-fit:cover;border-radius:6px"></div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${escapeHtml(it.nome)}</strong>
            <small style="color:#666">${formatPrice(it.preco)}</small>
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <label style="font-size:13px">Qtd</label>
            <input type="number" value="${it.qty}" min="1" style="width:72px;padding:6px;border-radius:6px;border:1px solid #ddd">
            <button class="btn-secundario btn-sm remove-btn">Remover</button>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:600">${formatPrice((parseFloat(it.preco)||0)*(parseInt(it.qty)||1))}</div>
        </div>
      `;

      const qtyInput = row.querySelector('input[type="number"]');
      qtyInput.addEventListener('change', (e) => {
        const nv = parseInt(e.target.value||0,10); if(isNaN(nv)||nv<1){ e.target.value = it.qty; return; }
        setQty(it.id_item, nv);
      });
      row.querySelector('.remove-btn').addEventListener('click', ()=>{ if(confirm('Remover este item do carrinho?')) removeItem(it.id_item); });

      itemsEl.appendChild(row);
    });

    totalEl.textContent = formatPrice(cartTotal());
    updateHeaderCount();
  }

async function checkout() {
  try {
    const restRaw = localStorage.getItem('fe_selected_restaurant');
    if (!restRaw) {
      alert('Restaurante não selecionado. Volte à lista e escolha um restaurante.');
      return;
    }
    const rest = JSON.parse(restRaw);

    const clienteRaw = localStorage.getItem('fe_user');
    let id_cliente = null;
    if (clienteRaw) {
      try {
        const cliente = JSON.parse(clienteRaw);
        id_cliente = cliente.id_cliente ?? cliente.id ?? cliente.idCliente ?? cliente.userId ?? cliente.user?.id ?? null;
      } catch (e) {
        console.warn('checkout: erro ao parsear fe_user', e);
      }
    }
    const token = localStorage.getItem('fe_token') || localStorage.getItem('fe_restaurant_token') || null;

    if (!id_cliente) {
      alert('Login obrigatório para efetuar pedido. Faça login antes de finalizar.');
      return;
    }

    let cart = [];
    if (typeof getCart === 'function') {
      try { cart = getCart() || []; } catch (e) { cart = []; }
    }
    if (!cart || !cart.length) {
      const raw = localStorage.getItem('fe_cart');
      cart = raw ? JSON.parse(raw) : [];
    }

    if (!cart.length) {
      alert('Carrinho vazio.');
      return;
    }

    const itens = cart.map(it => {
      const quantidade = parseInt(it.qty ?? it.quantidade ?? 1, 10) || 1;
      const preco = parseFloat(it.preco ?? it.price ?? 0) || 0;
      return {
        id_item: it.id_item ?? null,
        descricao: it.nome ?? it.descricao ?? '',
        quantidade,
        preco
      };
    });

    if (!itens.every(i => i.descricao && i.quantidade > 0 && !isNaN(i.preco))) {
      alert('Existem itens inválidos no carrinho. Verifique nome, quantidade e preço.');
      return;
    }

    const payload = {
      id_restaurante: rest.id_restaurante,
      id_cliente: id_cliente,
      horario: new Date().toISOString().slice(0,19).replace('T',' '),
      itens
    };

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch('http://localhost:3000/api/pedidos', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = body?.message || `Erro ao criar pedido (${res.status})`;
      alert(msg);
      console.error('checkout error:', body || res.statusText);
      return;
    }

    alert('Pedido criado com sucesso! ID: ' + (body?.pedido?.id_pedido ?? '—'));
    if (typeof clearCart === 'function') {
      try { clearCart(); } catch(e){ localStorage.removeItem('fe_cart'); }
    } else {
      localStorage.removeItem('fe_cart');
    }

  } catch (err) {
    console.error('checkout exception:', err);
    alert('Erro inesperado ao finalizar pedido. Veja o console.');
  }
}


  function updateHeaderCount(){
    const el = document.getElementById('headerCartCount');
    if(!el) return;
    const count = getCart().reduce((s,it)=> s + (parseInt(it.qty||1)||0), 0);
    el.textContent = count;
  }

  function escapeHtml(s){ if(!s&&s!==0) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  window.cart = {
    addItem, setQty, removeItem, clearCart, openCartPanel, closeCartPanel
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    updateHeaderCount();
    const btn = document.getElementById('headerCartBtn');
    if(btn) btn.addEventListener('click', ()=> { window.cart.openCartPanel(); });
  });

})();
