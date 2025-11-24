// user-page.js — Dropdown exclusivo da página user.html

document.addEventListener("DOMContentLoaded", () => {

  const perfilBtn = document.querySelector(".perfil-btn"); 
  const wrapper = document.querySelector(".perfil-action");

  if (!perfilBtn || !wrapper) return;

  // Criar dropdown via JS — sem alterar o HTML original
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

  // Insere o dropdown dentro do header
  wrapper.style.position = "relative";
  wrapper.appendChild(dropdown);

  const logoutBtn = dropdown.querySelector(".logout-btn");

  // Abre/fecha dropdown
  perfilBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fe_token");
    localStorage.removeItem("fe_user");
    window.location.href = "../html/home.html";
  });

  // Fecha ao clicar fora
  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });
});
