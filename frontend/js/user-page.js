document.addEventListener("DOMContentLoaded", () => {

  const perfilBtn = document.querySelector(".perfil-btn"); 
  const wrapper = document.querySelector(".perfil-action");

  if (!perfilBtn || !wrapper) return;

  const dropdown = document.createElement("div");
  dropdown.className = "user-dropdown-menu";
  dropdown.style.cssText = `
    display:none;
    position:absolute;
    right:0;
    top:110%;
    background:white;
    border-radius:6px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    padding:8px 0;
    z-index:1000;
    width:160px;
  `;

  dropdown.innerHTML = `
    <button class="logout-btn" style="
      width:100%;
      padding:10px 14px;
      border:none;
      background:none;
      font-size:16px;
      text-align:left;
      cursor:pointer;
    ">Sair</button>
  `;

  wrapper.style.position = "relative";
  wrapper.appendChild(dropdown);

  const logoutBtn = dropdown.querySelector(".logout-btn");

  perfilBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fe_token");
    localStorage.removeItem("fe_user");
    window.location.href = "../html/home.html";
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });

  async function ensureEditUserModal() {
    if (document.getElementById('feEditUserOverlay'))
      return document.getElementById('feEditUserOverlay');

    try {
      const modalPath = '../html/modals/edit-user-modal.html';
      const res = await fetch(modalPath, { cache: 'no-store' });
      if (!res.ok) throw new Error('Não foi possível carregar modal de edição.');
      
      const html = await res.text();
      document.body.insertAdjacentHTML('beforeend', html);

      const overlay = document.getElementById('feEditUserOverlay');
      const closeBtn = document.getElementById('feEditUserClose');
      const cancelBtn = document.getElementById('feEditUserCancel');

      function close() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      }

      closeBtn?.addEventListener('click', close);
      cancelBtn?.addEventListener('click', close);
      overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

      return overlay;
    } catch (err) {
      console.error('ensureEditUserModal error:', err);
      throw err;
    }
  }

  document.getElementById('btnEditUser')?.addEventListener('click', async () => {
    try {
      const overlay = await ensureEditUserModal();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');

      const userRaw = localStorage.getItem('fe_user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      document.getElementById('fe_edit_tel').value = user?.telefone || '';
      document.getElementById('fe_edit_end').value = user?.endereco || '';
      document.getElementById('fe_edit_pass').value = '';

      const form = document.getElementById('feEditUserForm');

      const submitHandler = async function (e) {
        e.preventDefault();

        const telefoneRaw = document.getElementById('fe_edit_tel').value.trim();
        const endereco = document.getElementById('fe_edit_end').value.trim();
        const password = document.getElementById('fe_edit_pass').value.trim();

        let ok = true;

        const tel = telefoneRaw.replace(/\D/g, "");
        if (tel.length < 8 || tel.length > 11) {
          alert("Telefone inválido. Use somente números e entre 8 e 11 dígitos.");
          ok = false;
        }

        if (!endereco || endereco.length < 5 || /^\d+$/.test(endereco)) {
          alert("Endereço inválido. Informe rua, número e bairro.");
          ok = false;
        }

        if (password.length > 0 && password.length < 6) {
          alert("A nova senha deve ter pelo menos 6 caracteres.");
          ok = false;
        }

        if (!ok) return;

        const payload = { telefone: tel, endereco };
        if (password.length >= 6) payload.password = password;

        const token = localStorage.getItem('fe_token');
        if (!token) {
          alert('Usuário não autenticado.');
          return;
        }

        try {
          const res = await fetch('http://localhost:3000/api/auth/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
          });

          const body = await res.json().catch(()=>null);
          if (!res.ok) {
            alert(body?.message || 'Erro ao atualizar dados.');
            return;
          }

          if (body.user)
            localStorage.setItem('fe_user', JSON.stringify(body.user));

          alert("Dados atualizados com sucesso!");
          overlay.classList.remove('open');

          setTimeout(()=> location.reload(), 300);

        } catch (err) {
          console.error("Erro update user:", err);
          alert("Erro de conexão ao atualizar.");
        }
      };

      form.removeEventListener("submit", submitHandler);
      form.addEventListener("submit", submitHandler);

    } catch (err) {
      alert('Erro ao abrir o modal de edição. Veja console.');
    }
  });

  const CONFIRM_MODAL_PATH = '../html/modals/confirm-delete-modal.html';

  async function ensureConfirmDeleteModal() {
    const existing = document.getElementById('feConfirmDeleteOverlay');
    if (existing) return existing;

    try {
      const resp = await fetch(CONFIRM_MODAL_PATH, { cache: 'no-store' });
      if (!resp.ok) throw new Error('Não foi possível carregar modal de confirmação.');

      const html = await resp.text();
      document.body.insertAdjacentHTML('beforeend', html);

      const overlay = document.getElementById('feConfirmDeleteOverlay');
      const closeBtn = document.getElementById('feConfirmDeleteClose');
      const cancelBtn = document.getElementById('confirmDeleteCancel');

      function close() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      }

      closeBtn?.addEventListener('click', close);
      cancelBtn?.addEventListener('click', close);
      overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

      return overlay;
    } catch (err) {
      console.error('ensureConfirmDeleteModal error:', err);
      throw err;
    }
  }

  async function openDeleteFlow() {
    try {
      const overlay = await ensureConfirmDeleteModal();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');

      const okBtn = document.getElementById('confirmDeleteOk');

      okBtn.onclick = async () => {
        const token = localStorage.getItem('fe_token');
        if (!token) return alert("Usuário não autenticado.");

        const res = await fetch("http://localhost:3000/api/auth/me", {
          method: "DELETE",
          headers: { "Authorization": "Bearer " + token }
        });

        const body = await res.json().catch(()=>null);

        if (!res.ok) {
          alert(body?.message || "Erro ao apagar conta.");
          return;
        }

        localStorage.clear();
        alert("Conta apagada com sucesso.");
        window.location.href = "../html/home.html";
      };

    } catch (err) {
      alert("Erro ao abrir confirmação. Veja console.");
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#btnDeleteUser");
    if (btn) {
      e.preventDefault();
      openDeleteFlow();
    }
  });

});