// auth-guard.js — proteção global de páginas

(function () {
  const token = localStorage.getItem('fe_token');
  const user  = localStorage.getItem('fe_user');

  // Lista de páginas que NÃO exigem login
  // (ex: página inicial, login, etc — ajuste como quiser)
  const publicPages = [
    'home.html',
    'index.html'
  ];

  const currentPage = window.location.pathname.split('/').pop();

  // Se a página é pública, não faz nada
  if (publicPages.includes(currentPage)) {
    return;
  }

  // Se NÃO tiver token, manda para Home e abre modal de login
  if (!token || !user) {
    // Guarda a página que o usuário queria entrar
    localStorage.setItem('fe_redirect_after_login', window.location.href);

    // Vai para home
    window.location.href = './home.html?login=1';
  }
})();
