(function () {
  const cssPath = '../css/login-popup.css';
  const htmlPath = '../html/modals/login-restaurante-modal.html';

  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  }

  fetch(htmlPath, { cache: 'no-store' })
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      initRestaurantLoginModal();
    })
    .catch(err => console.error('Erro ao carregar login-restaurante-modal:', err));

  window.openRestLoginModal = function () {
    const token = localStorage.getItem('fe_restaurant_token');
    const rest = localStorage.getItem('fe_restaurant');

    if (token && rest) {
      window.location.href = "../html/restaurante-edit.html";
      return;
    }

    const overlay = document.getElementById("feRestLoginOverlay");
    overlay?.classList.add("open");
  };

  function initRestaurantLoginModal() {
    const overlay = document.getElementById('feRestLoginOverlay');
    const closeBtn = document.getElementById('feRestLoginClose');
    const form = document.getElementById('feRestLoginForm');

    let prevFocused = null;

    function openModal() {
      prevFocused = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const firstInput = document.getElementById('rest_login_name');
      setTimeout(() => firstInput?.focus(), 80);
    }

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (prevFocused && prevFocused.focus) prevFocused.focus();
    }

    window.openRestLoginModal = () => {
      const token = localStorage.getItem('fe_restaurant_token');
      const rest = localStorage.getItem('fe_restaurant');

      if (token && rest) {
        window.location.href = "../html/restaurante-edit.html";
        return;
      }

      openModal();
    };

    closeBtn?.addEventListener('click', closeModal);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    form?.addEventListener('submit', async e => {
      e.preventDefault();

      const nome = document.getElementById('rest_login_name').value.trim();
      const senha = document.getElementById('rest_login_password').value;

      if (!nome || senha.length < 6) {
        alert('Preencha os campos corretamente.');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/restaurants/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, senha })
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
          alert(body?.message || 'Erro ao fazer login');
          return;
        }

        console.log('Login restaurante OK:', body);

        localStorage.setItem('fe_restaurant_token', body.token);
        localStorage.setItem('fe_restaurant', JSON.stringify(body.restaurant));

        closeModal();

        setTimeout(() => {
          window.location.replace("../html/restaurante-edit.html");
        }, 150);

      } catch (err) {
        alert('Erro de conexão com servidor.');
        console.error(err);
      }
    });
  }
})();