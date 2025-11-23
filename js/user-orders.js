document.addEventListener('DOMContentLoaded', () => {
  initUserOrders();
});

async function initUserOrders() {
  const panel = document.getElementById('pedidos');
  if (!panel) return;

  let listWrap = panel.querySelector('.orders-list');
  if (!listWrap) {
    listWrap = document.createElement('div');
    listWrap.className = 'orders-list';
    listWrap.style.marginTop = '16px';
    panel.appendChild(listWrap);
  }

  listWrap.innerHTML = '<p>Carregando pedidos...</p>';

  const clienteRaw = localStorage.getItem('fe_user');
  let id_cliente = null;
  if (clienteRaw) {
    try {
      const cliente = JSON.parse(clienteRaw);
      id_cliente = cliente.id_cliente ?? cliente.id ?? cliente.idCliente ?? cliente.userId ?? cliente.user?.id ?? null;
    } catch (e) {
      console.warn('user-orders: erro ao parsear fe_user', e);
    }
  }

  if (!id_cliente) {
    listWrap.innerHTML = '<p>Você precisa estar logado para ver seus pedidos. Faça login e tente novamente.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/pedidos?cliente=${encodeURIComponent(id_cliente)}`);
    if (!res.ok) throw new Error('Erro HTTP ' + res.status);
    const body = await res.json();
    const pedidos = body.pedidos || [];

    if (!pedidos.length) {
      listWrap.innerHTML = '<p>Você ainda não fez pedidos.</p>';
      return;
    }

    listWrap.innerHTML = '';
    pedidos.forEach(p => {
      const orderEl = renderOrderCard(p);
      listWrap.appendChild(orderEl);
    });

  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
    listWrap.innerHTML = '<p>Erro ao carregar seus pedidos. Veja o console.</p>';
  }
}

function renderOrderCard(pedido) {
  const wrap = document.createElement('div');
  wrap.className = 'order-card';
  wrap.style.border = '1px solid #eee';
  wrap.style.padding = '12px';
  wrap.style.marginBottom = '12px';
  wrap.style.borderRadius = '8px';
  wrap.style.background = '#fff';

  const horario = pedido.horario ? new Date(pedido.horario) : null;
  const dateStr = horario ? horario.toLocaleString() : (pedido.horario ?? '');

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = `
    <div>
      <strong>Pedido #${(pedido.id_pedido ?? pedido.id) || '—'}</strong>
      <div style="font-size:13px;color:#666"> ${dateStr} • Restaurante ${pedido.id_restaurante ?? '—'}</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700">${formatStatus(pedido.status)}</div>
    </div>
  `;
  wrap.appendChild(header);

  const itemsBox = document.createElement('div');
  itemsBox.style.marginTop = '10px';
  itemsBox.style.fontSize = '14px';
  itemsBox.style.color = '#333';

  if (pedido.itens && Array.isArray(pedido.itens) && pedido.itens.length) {
    const ul = document.createElement('ul');
    ul.style.margin = '6px 0';
    ul.style.paddingLeft = '18px';
    pedido.itens.forEach(it => {
      const li = document.createElement('li');
      const q = it.quantidade ?? it.quant ?? it.qty ?? 1;
      const preco = parseFloat(it.preco ?? it.price ?? 0) || 0;
      li.textContent = `${q} x ${it.descricao ?? it.nome ?? 'Item'} — R$ ${preco.toFixed(2)}`;
      ul.appendChild(li);
    });
    itemsBox.appendChild(ul);

    const total = pedido.itens.reduce((s,it) => s + (parseFloat(it.preco ?? it.price ?? 0) || 0) * (parseInt(it.quantidade ?? it.qty ?? 1,10)||1), 0);
    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '8px';
    totalDiv.style.fontWeight = '700';
    totalDiv.textContent = 'Total: R$ ' + total.toFixed(2);
    itemsBox.appendChild(totalDiv);

  } else {
    itemsBox.innerHTML = `<div style="color:#666">Itens não retornados pelo servidor para este pedido.</div>`;
  }

  wrap.appendChild(itemsBox);

  const actions = document.createElement('div');
  actions.style.marginTop = '10px';
  actions.style.display = 'flex';
  actions.style.gap = '8px';

  const btnDetails = document.createElement('button');
  btnDetails.className = 'btn-secundario btn-sm';
  btnDetails.textContent = 'Ver detalhes';
  btnDetails.addEventListener('click', () => {
    const id = pedido.id_pedido ?? pedido.id;
    window.location.href = `./pedido-detalhe.html?id=${encodeURIComponent(id)}`;
  });

  const btnRepeat = document.createElement('button');
  btnRepeat.className = 'btn-primario btn-sm';
  btnRepeat.textContent = 'Repetir pedido';
  btnRepeat.addEventListener('click', () => {
    repeatOrder(pedido);
  });

  actions.appendChild(btnDetails);
  actions.appendChild(btnRepeat);
  wrap.appendChild(actions);

  return wrap;
}

function repeatOrder(pedido) {
  if (!pedido.itens || !pedido.itens.length) {
    alert('Itens não disponíveis para repetição.');
    return;
  }
  const cart = (pedido.itens || []).map(it => ({
    id_item: it.id_item ?? null,
    nome: it.descricao ?? it.nome ?? 'Item',
    preco: parseFloat(it.preco ?? it.price ?? 0) || 0,
    qty: parseInt(it.quantidade ?? it.qty ?? 1, 10) || 1
  }));
  localStorage.setItem('fe_cart', JSON.stringify(cart));
  window.location.href = '../html/restaurante.html';
}

function formatStatus(status) {
  if (!status) return '';
  const s = String(status).toLowerCase();
  if (s.includes('preparo') || s.includes('prepar')) return 'Em preparo';
  if (s.includes('caminho') || s.includes('a caminho')) return 'A caminho';
  if (s.includes('entreg')) return 'Entregue';
  return status;
}
