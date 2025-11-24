// auth-client.js — atualiza botão de login para mostrar usuário / logout
(function () {
  function getUser() {
    try {
      const u = localStorage.getItem('fe_user');
      return u ? JSON.parse(u) : null;
    } catch (e) { return null; }
  }

function renderUserUI() {
  const user = getUser();
  const loginWrapper = document.querySelector('.opcoes .login');
  if (!loginWrapper) return;

  loginWrapper.innerHTML = '';

  if (user) {
    // Botão simples -> Clicou -> Vai para página de perfil
    loginWrapper.innerHTML = `
      <button class="fe-user-btn" type="button" title="Abrir perfil" style="display:flex;align-items:center;gap:6px;">
        <img src="../imagens/user.svg" alt="" style="width:24px;height:24px;">
        <span>${escapeHtml(user.nome || "Perfil")}</span>
      </button>
    `;

    const btn = loginWrapper.querySelector('.fe-user-btn');
    btn.addEventListener('click', () => {
      // 👉 coloque aqui o caminho da página que deve abrir
      window.location.href = "../html/user.html";
    });

  } else {
    // Sem login → botão normal
    loginWrapper.innerHTML = `
      <button type="button" onclick="openLoginPopup()" style="display:flex;align-items:center;">
        <img src="../imagens/exit.svg" alt="" style="width:24px;height:24px;margin-right:6px;">
        <span>Login</span>
      </button>
    `;
  }
}



  // escape simples para evitar injeção se usuario.nome tiver caracteres estranhos
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // roda logo que o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderUserUI);
  } else {
    renderUserUI();
  }

  // opcional: observar mudanças em localStorage (quando login ocorre em outra aba)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'fe_user' || ev.key === 'fe_token') renderUserUI();
  });
})();
