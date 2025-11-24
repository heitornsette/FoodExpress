(function () {
  console.log("Arquivo restaurante-logout.js carregado.");

  const btn = document.getElementById("restLogoutBtn");

  if (!btn) {
    console.warn("⚠️ Botão de logout do restaurante não encontrado no DOM.");
    return;
  }

  btn.addEventListener("click", () => {

    localStorage.removeItem("fe_restaurant_token");
    localStorage.removeItem("fe_restaurant");

    window.location.href = "../html/home.html";
  });

})();
