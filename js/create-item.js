(function () {

  const modalPaths = [
    "../html/create-item-modal.html",
    "./html/create-item-modal.html"
  ];

  async function openCreateItemModal() {
    let overlay = document.getElementById("feCreateItemOverlay");

    if (overlay) {
      overlay.classList.add("open");
      return;
    }

    for (const path of modalPaths) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) continue;

        const html = await res.text();
        if (!html.includes("feCreateItemOverlay")) continue;

        document.body.insertAdjacentHTML("beforeend", html);

        initCreateItemModal();
        return;

      } catch (err) { }
    }

    alert("Erro ao carregar modal de criação de item.");
  }

  window.openCreateItemModal = openCreateItemModal;

  function initCreateItemModal() {
    const overlay = document.getElementById("feCreateItemOverlay");
    const closeBtn = document.getElementById("feCreateItemClose");
    const form = document.getElementById("feCreateItemForm");

    function close() {
      overlay.classList.remove("open");
    }

    closeBtn?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const item = {
        nome: document.getElementById("item_name").value.trim(),
        descricao: document.getElementById("item_desc").value.trim(),
        preco: parseFloat(document.getElementById("item_price").value),
        categoria: document.getElementById("item_cat").value.trim()
      };

      const rest = JSON.parse(localStorage.getItem("fe_restaurant"));
      if (!rest) {
        alert("Erro: restaurante não encontrado.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/restaurants/${rest.id_restaurante}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });

        const body = await res.json();

        if (!res.ok) {
          alert(body.message || "Erro ao salvar item");
          return;
        }

        alert("Item criado com sucesso!");
        close();

      } catch (err) {
        alert("Erro de conexão com servidor.");
        console.error(err);
      }
    });
  }

})();
