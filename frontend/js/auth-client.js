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
    loginWrapper.innerHTML = `
      <button class="fe-user-btn" type="button" title="Abrir perfil" style="display:flex;align-items:center;gap:6px;">
        <img src="../imagens/user.svg" alt="" style="width:24px;height:24px;">
        <span>${escapeHtml(user.nome || "Perfil")}</span>
      </button>
    `;

    const btn = loginWrapper.querySelector('.fe-user-btn');
    btn.addEventListener('click', () => {
      window.location.href = "../html/user.html";
    });

  } else {
    loginWrapper.innerHTML = `
      <button type="button" onclick="openLoginPopup()" style="display:flex;align-items:center;">
        <img src="../imagens/exit.svg" alt="" style="width:24px;height:24px;margin-right:6px;">
        <span>Login</span>
      </button>
    `;
  }
}

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderUserUI);
  } else {
    renderUserUI();
  }

  window.addEventListener('storage', (ev) => {
    if (ev.key === 'fe_user' || ev.key === 'fe_token') renderUserUI();
  });
})();