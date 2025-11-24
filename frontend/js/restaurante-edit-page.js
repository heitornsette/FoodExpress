document.addEventListener("DOMContentLoaded", () => {

  async function loadEditModal() {
    if (document.getElementById("feEditRestOverlay"))
      return document.getElementById("feEditRestOverlay");

    const res = await fetch("../html/modals/edit-restaurant-modal.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const overlay = document.getElementById("feEditRestOverlay");
    const closeBtn = document.getElementById("feEditRestClose");
    const cancelBtn = document.getElementById("feEditRestCancel");

    const close = () => overlay.classList.remove("open");

    closeBtn.onclick = close;
    cancelBtn.onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    return overlay;
  }

  document.getElementById("btnEditRestaurant")?.addEventListener("click", async () => {
    const overlay = await loadEditModal();
    overlay.classList.add("open");

    const restRaw = localStorage.getItem("fe_restaurant");
    if (!restRaw) return alert("Restaurante não encontrado.");

    const rest = JSON.parse(restRaw);

    document.getElementById("fe_edit_rest_nome").value = rest.nome;
    document.getElementById("fe_edit_rest_cozinha").value = rest.cozinha;
    document.getElementById("fe_edit_rest_tel").value = rest.telefone;
    document.getElementById("fe_edit_rest_pass").value = "";
    
    applyEditHandler(rest.id_restaurante, overlay);
  });

  function applyEditHandler(id_restaurante, overlay) {
    const form = document.getElementById("feEditRestForm");

    form.onsubmit = async (e) => {
      e.preventDefault();

      const nome = document.getElementById("fe_edit_rest_nome").value.trim();
      const cozinha = document.getElementById("fe_edit_rest_cozinha").value.trim();
      const telefoneRaw = document.getElementById("fe_edit_rest_tel").value.trim();
      const senha = document.getElementById("fe_edit_rest_pass").value.trim();

      let ok = true;

      if (!nome || nome.length < 2) { alert("Nome inválido."); ok = false; }
      if (!cozinha || cozinha.length < 3) { alert("Cozinha inválida."); ok = false; }

      const tel = telefoneRaw.replace(/\D/g, "");
      if (tel.length < 8 || tel.length > 11) {
        alert("Telefone inválido, use entre 8 e 11 dígitos.");
        ok = false;
      }

      if (senha && senha.length < 6) {
        alert("A nova senha deve ter pelo menos 6 caracteres.");
        ok = false;
      }

      if (!ok) return;

      const payload = { nome, cozinha, telefone: tel };
      if (senha) payload.senha = senha;

      const token = localStorage.getItem("fe_restaurant_token");

      try {
        const res = await fetch(`http://localhost:3000/api/restaurants/${id_restaurante}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(payload)
        });

        const body = await res.json().catch(()=>null);
        if (!res.ok) {
          alert(body?.message || "Erro ao atualizar restaurante.");
          return;
        }

        localStorage.setItem("fe_restaurant", JSON.stringify(body.restaurant));
        alert("Restaurante atualizado!");

        overlay.classList.remove("open");
        setTimeout(()=> location.reload(), 200);

      } catch (err) {
        console.error(err);
        alert("Erro ao atualizar restaurante.");
      }
    };
  }

  async function loadDeleteModal() {
    if (document.getElementById("feConfirmDeleteRestOverlay"))
      return document.getElementById("feConfirmDeleteRestOverlay");

    const resp = await fetch("../html/modals/confirm-delete-restaurant.html");
    const html = await resp.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const overlay = document.getElementById("feConfirmDeleteRestOverlay");

    document.getElementById("feConfirmDeleteRestClose").onclick = () => overlay.classList.remove("open");
    document.getElementById("confirmDeleteRestCancel").onclick = () => overlay.classList.remove("open");
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove("open"); };

    return overlay;
  }

  document.getElementById("btnDeleteRestaurant")?.addEventListener("click", async () => {
    const overlay = await loadDeleteModal();
    overlay.classList.add("open");

    const restRaw = localStorage.getItem("fe_restaurant");
    if (!restRaw) return alert("Restaurante não encontrado.");
    const rest = JSON.parse(restRaw);

    const okBtn = document.getElementById("confirmDeleteRestOk");

    okBtn.onclick = async () => {
      const token = localStorage.getItem("fe_restaurant_token");

      const res = await fetch(`http://localhost:3000/api/restaurants/${rest.id_restaurante}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      const body = await res.json().catch(()=>null);

      if (!res.ok) {
        alert(body?.message || "Erro ao apagar restaurante.");
        return;
      }

      alert("Restaurante apagado com sucesso.");

      localStorage.removeItem("fe_restaurant");
      localStorage.removeItem("fe_restaurant_token");

      window.location.href = "../html/home.html";
    };
  });

});
