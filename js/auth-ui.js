document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("fe_token");
    const userData = localStorage.getItem("fe_user");

    const loginDiv = document.querySelector(".login");
    if (!loginDiv) return;

    if (!token || !userData) return;

    const user = JSON.parse(userData);
    const primeiroNome = user.nome ? user.nome.split(" ")[0] : "Perfil";

    loginDiv.innerHTML = `
        <div class="perfil-area">
            <button class="perfil-btn" id="perfilBtn">
                <img src="../imagens/user.svg">
                <p>${primeiroNome}</p>
            </button>

            <div class="profile-menu hidden" id="profileMenu">
                <p><strong>${user.nome}</strong></p>
                <p>${user.email}</p>

                <button class="logout-btn" id="logoutBtn">Sair</button>
            </div>
        </div>
    `;

    const perfilBtn = document.getElementById("perfilBtn");
    const profileMenu = document.getElementById("profileMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    perfilBtn.addEventListener("click", () => {
        profileMenu.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("fe_token");
        localStorage.removeItem("fe_user");
        window.location.reload();
    });

    document.addEventListener("click", (e) => {
        if (!profileMenu.contains(e.target) && !perfilBtn.contains(e.target)) {
            profileMenu.classList.add("hidden");
        }
    });
});