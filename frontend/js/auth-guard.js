(function () {
  const token = localStorage.getItem('fe_token');
  const user  = localStorage.getItem('fe_user');

  const publicPages = [
    'home.html',
    'index.html'
  ];

  const currentPage = window.location.pathname.split('/').pop();

  if (publicPages.includes(currentPage)) {
    return;
  }

  if (!token || !user) {
    localStorage.setItem('fe_redirect_after_login', window.location.href);

    window.location.href = './home.html?login=1';
  }
})();
