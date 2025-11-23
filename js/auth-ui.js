document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("fe_token");
  const userData = localStorage.getItem("fe_user");

  if (!token || !userData) return;

  let user;
  try {
    user = JSON.parse(userData);
  } catch (e) {
    console.error("auth-ui: erro ao parsear fe_user", e);
    return;
  }

  const primeiroNome = user.nome ? user.nome.split(" ")[0] : "Perfil";

  function doLogout(redirect = "/html/home.html") {
    localStorage.removeItem("fe_token");
    localStorage.removeItem("fe_user");
    window.location.href = redirect;
  }

  const loginDiv = document.querySelector(".login");
  if (loginDiv) {
    loginDiv.innerHTML = `
      <div class="perfil-area">
        <button class="perfil-btn" id="perfilBtn">
          <img src="../imagens/user.svg" alt="Usuário" />
          <p>${primeiroNome}</p>
        </button>
      </div>
    `;

    document.getElementById("perfilBtn")?.addEventListener("click", () => {
      window.location.href = "/html/user.html";
    });

    return;
  }

  const perfilAction = document.querySelector(".perfil-action");
  if (!perfilAction) return;

  let btn = perfilAction.querySelector("button");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "perfil-btn";
    perfilAction.appendChild(btn);
  }

  btn.removeAttribute("onclick");
  btn.innerHTML = `
    <img src="../imagens/user.svg" class="perfil-ico">
    <span class="perfil-name">${primeiroNome}</span>
  `;
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");

  let menu = perfilAction.querySelector(".profile-menu");
  if (!menu) {
    menu = document.createElement("div");
    menu.className = "profile-menu";
    menu.innerHTML = `
      <button class="profile-menu-item profile-logout" data-action="logout">
        Desfazer login
      </button>
    `;
    perfilAction.appendChild(menu);
  }

  function openMenu() {
    menu.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
  }

  function closeMenu() {
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeyDown);
  }

  function toggleMenu(e) {
    e.stopPropagation();
    menu.classList.contains("open") ? closeMenu() : openMenu();
  }

  function onDocClick(e) {
    if (!perfilAction.contains(e.target)) closeMenu();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closeMenu();
  }

  btn.addEventListener("click", toggleMenu);

  menu.addEventListener("click", (e) => {
    if (e.target.dataset.action === "logout") {
      doLogout("/html/home.html");
    }
  });

});
