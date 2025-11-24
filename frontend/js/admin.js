const API_BASE = "http://127.0.0.1:3000";

document.addEventListener("DOMContentLoaded", () => {
  initAdminFlow().catch(err => console.error("initAdminFlow error:", err));
});

async function initAdminFlow() {
  let token = localStorage.getItem("fe_token");
  let userRaw = localStorage.getItem("fe_user");
  let user = null;

  if (userRaw) {
    try { user = JSON.parse(userRaw); }
    catch (e) { console.warn("Erro ao parsear fe_user:", e); }
  }

  if (token && !user) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user || data;
        localStorage.setItem("fe_user", JSON.stringify(user));
      }
    } catch (err) {
      console.warn("Erro ao buscar /auth/me:", err);
    }
  }

  if (!user) return;

  const isAdmin = user.is_admin === 1 || user.is_admin === "1" || user.is_admin === true;

  const adminBtn = document.querySelector(".admin-footer-btn");
  if (adminBtn) {
    if (isAdmin) {
      adminBtn.classList.remove("hidden-admin");
      adminBtn.addEventListener("click", openCreateRestaurantModal);
    } else {
      adminBtn.classList.add("hidden-admin");
    }
  }

  const modalPaths = [ "../html/modals/create-restaurant-modal.html"];

  async function openCreateRestaurantModal() {
    const existing = document.getElementById("feCreateRestOverlay");
    if (existing) { existing.classList.add("open"); return; }

    for (const path of modalPaths) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) continue;

        const html = await res.text();
        if (!html.includes("feCreateRestOverlay")) continue;

        document.body.insertAdjacentHTML("beforeend", html);

        initCreateRestaurantModal();
        return;

      } catch (e) {}
    }

    alert("Erro ao carregar modal de criação.");
  }

  function initCreateRestaurantModal() {
    const overlay = document.getElementById("feCreateRestOverlay");
    const closeBtn = document.getElementById("feCreateRestClose");
    const form = document.getElementById("feCreateRestForm");

    overlay.classList.add("open");

    function close() {
      overlay.classList.remove("open");
    }

    closeBtn?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const nome = form.querySelector("#rest_name")?.value.trim();
      const cozinha = form.querySelector("#rest_cuisine")?.value.trim();
      const telefone = form.querySelector("#rest_tel")?.value.trim();
      const senha = form.querySelector("#rest_password")?.value.trim();

      if (!nome) return alert("O nome é obrigatório.");
      if (!cozinha) return alert("O tipo de cozinha é obrigatório.");
      if (!telefone) return alert("O telefone é obrigatório.");
      if (!senha) return alert("A senha é obrigatória.");

      const payload = { nome, cozinha, telefone, senha };

      try {
        const res = await fetch(`${API_BASE}/api/restaurants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + (localStorage.getItem("fe_token") || "")
          },
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        let data = null;

        try { data = text ? JSON.parse(text) : null; } catch {}

        if (!res.ok) {
          return alert(data?.message || text || "Erro ao criar restaurante");
        }

        alert("Restaurante criado com sucesso!");
        close();

        window.loadRestaurants?.();

      } catch (err) {
        console.error("Erro ao criar restaurante:", err);
        alert("Erro ao criar restaurante: " + err.message);
      }
    });
  }
}
