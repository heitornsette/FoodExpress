(function () {
  const cssPath = '../css/login-popup.css';
  const htmlPath = '../html/modals/login-modal.html';

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
      initModalBehavior();
    })
    .catch(err => {
      console.error('Erro ao carregar login-modal.html:', err);
    });

  function initModalBehavior() {
    const overlay = document.getElementById('feLoginOverlay');
    const closeBtn = document.getElementById('feLoginClose');
    const tabs = Array.from(document.querySelectorAll('.fe-login-tab'));
    const panels = Array.from(document.querySelectorAll('.fe-panel'));
    const form = document.getElementById('feLoginForm');
    const title = document.getElementById('feLoginTitle');
    const continueGuest = document.getElementById('feContinueGuest');

    let prevFocused = null;
    let removeTrap = null;

    function trapFocus(container) {
      const focusable = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first) return () => {};

      function handler(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      document.addEventListener('keydown', handler);

      return () => document.removeEventListener('keydown', handler);
    }

    function openModal(tab = 'login') {
      prevFocused = document.activeElement;

      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      switchToTab(tab);

      setTimeout(() => {
        const visiblePanel = document.querySelector('.fe-panel:not([hidden])');
        const firstInput = visiblePanel?.querySelector('input, button');
        if (firstInput) firstInput.focus();
      }, 60);

      removeTrap = trapFocus(overlay);
    }

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (removeTrap) removeTrap();
      if (prevFocused && prevFocused.focus) prevFocused.focus();
    }

    window.openLoginPopup = ({ tab } = {}) => openModal(tab || 'login');

    closeBtn.addEventListener('click', closeModal);
    
    function switchToTab(tab) {
      tabs.forEach(t => {
        const active = t.dataset.tab === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active);
      });

      panels.forEach(p => {
        const active = p.dataset.panel === tab;
        if (active) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });

      title.textContent = tab === 'login' ? 'Entrar' : 'Criar conta';
    }

    tabs.forEach(t => {
      t.addEventListener('click', () => switchToTab(t.dataset.tab));
    });

    continueGuest?.addEventListener('click', () => closeModal());

    form.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      if (btn.dataset.action === 'forgot') {
        alert('Fluxo de recuperação de senha não implementado.');
      } else if (btn.dataset.action === 'switch-login') {
        switchToTab('login');
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const panel = document.querySelector('.fe-panel:not([hidden])')?.dataset.panel;
      clearErrors();

      if (panel === 'login') handleLogin();
      else handleSignup();
    });

async function handleLogin() {
  const email = (document.getElementById('fe_login_email') || {}).value?.trim() || '';
  const pass = (document.getElementById('fe_login_password') || {}).value || '';

  clearErrors();

  let ok = true;
  if (!validateEmail(email)) {
    showError('fe_err_email', 'Email inválido');
    ok = false;
  }
  if (pass.length < 6) {
    showError('fe_err_pass', 'A senha deve ter pelo menos 6 caracteres');
    ok = false;
  }
  if (!ok) return;

  try {
    console.log('[LOGIN] enviando requisição', { email });

    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    console.log('[LOGIN] status:', res.status, 'ok:', res.ok);

    let body = null;
    try {
      body = await res.json();
    } catch (err) {
      console.warn('[LOGIN] resposta não é JSON ou corpo vazio', err);
    }
    console.log('[LOGIN] corpo:', body);

    if (!res.ok) {
      const msg = body && body.message ? body.message : `Erro ${res.status}`;
      if (res.status === 401) {
        showError('fe_err_pass', msg);
      } else {
        showError('fe_err_email', msg);
      }
      return;
    }

    if (body && body.token) {
      try {
        localStorage.setItem('fe_token', body.token);
        if (body.user) localStorage.setItem('fe_user', JSON.stringify(body.user));
        else localStorage.removeItem('fe_user');
      } catch (err) {
        console.warn('[LOGIN] erro ao acessar localStorage', err);
      }

      successMessage('Entrou com sucesso!');

      setTimeout(() => {
        try { closeModal(); } catch (e) {}
        window.location.reload();
      }, 500);
    } else {
      showError('fe_err_pass', body && body.message ? body.message : 'Resposta inválida do servidor.');
    }
  } catch (err) {
    console.error('Erro login (fetch):', err);
    showError('fe_err_pass', 'Erro de conexão com o servidor.');
  }
}


function handleSignup() {
  const nameEl = document.getElementById('fe_signup_name');
  const emailEl = document.getElementById('fe_signup_email');
  const passEl = document.getElementById('fe_signup_password');
  const telEl = document.getElementById('fe_signup_telefone');
  const endEl = document.getElementById('fe_signup_endereco');

  const name = nameEl?.value.trim() || '';
  const email = emailEl?.value.trim() || '';
  const pass = passEl?.value || '';
  const telRaw = telEl?.value.trim() || '';

  const endereco = endEl?.value.trim() || '';

  clearErrors();

  let ok = true;

  const nameRe = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,100}$/u;
  if (!nameRe.test(name)) {
    showError('fe_err_name', "Nome invalido, use apenas letras.");
    ok = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('fe_err_semail', 'Email inválido.');
    ok = false;
  }

  if (pass.length < 6) {
    showError('fe_err_spass', 'Senha deve ter ao menos 6 caracteres.');
    ok = false;
  }

  const digits = telRaw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 11) {
    showError('fe_err_telefone', 'Telefone invalido.');
    ok = false;
  }

  if (!endereco || endereco.length < 5 || /^\d+$/.test(endereco)) {
    showError('fe_err_endereco', 'Endereço invalido.');
    ok = false;
  }

  if (!ok) return;

  const telefone = digits;

  fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass, telefone, endereco })
  })
  .then(async res => {
    const body = await res.json().catch(()=>null);
    if (!res.ok) {
      const msg = body && body.message ? body.message : `Erro ${res.status}`;
      throw new Error(msg);
    }
    return body;
  })
  .then(data => {
    successMessage('Conta criada com sucesso! Faça login para acessar.');

    const loginEmail = document.getElementById('fe_login_email');
    const loginPass = document.getElementById('fe_login_password');
    if (loginEmail) loginEmail.value = email;
    if (loginPass) loginPass.value = '';

    switchToTab('login');

    passEl.value = '';
    telEl.value = '';
    endEl.value = '';
    nameEl.value = '';
    emailEl.value = '';
  })
  .catch(err => {
    showError('fe_err_telefone', err.message || 'Erro ao criar conta');
  });
}

    function showError(id, msg) {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
    }

    function clearErrors() {
      document.querySelectorAll('.fe-error').forEach(el => (el.textContent = ''));
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function successMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'fe-success';
      msg.style.marginTop = '8px';
      msg.textContent = text;
      title.insertAdjacentElement('afterend', msg);
      setTimeout(() => msg.remove(), 1500);
    }
  }
})();