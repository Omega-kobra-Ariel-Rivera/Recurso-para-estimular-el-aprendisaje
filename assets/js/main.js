// Comportamiento común a todas las páginas

// ---------- Menú en celular ----------
(function () {
    const boton = document.querySelector(".boton-menu");
    const menu = document.getElementById("menu");
    if (!boton || !menu) return;

    function cerrar() {
        menu.classList.remove("abierto");
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-label", "Abrir menú");
    }

    boton.addEventListener("click", () => {
        const abierto = menu.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", String(abierto));
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrar();
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !boton.contains(e.target)) cerrar();
    });
})();

// ---------- Año actual en el pie ----------
document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = new Date().getFullYear();
});

// ---------- Visor de fotos (página Sobre mí) ----------
(function () {
    const visor = document.querySelector(".visor");
    const botones = Array.from(document.querySelectorAll(".galeria [data-foto]"));
    if (!visor || !botones.length || typeof visor.showModal !== "function") return;

    const img = visor.querySelector("img");
    let actual = 0;

    function mostrar(i) {
        actual = (i + botones.length) % botones.length;
        img.src = botones[actual].dataset.foto;
        img.alt = botones[actual].dataset.texto || "";
    }

    botones.forEach((b, i) => {
        b.addEventListener("click", () => {
            mostrar(i);
            visor.showModal();
        });
    });

    visor.addEventListener("click", (e) => {
        const accion = e.target.dataset.visor;
        if (accion === "cerrar" || e.target === visor) visor.close();
        if (accion === "anterior") mostrar(actual - 1);
        if (accion === "siguiente") mostrar(actual + 1);
    });

    visor.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") mostrar(actual - 1);
        if (e.key === "ArrowRight") mostrar(actual + 1);
    });

    // Deslizar con el dedo en celular
    let inicioX = null;
    visor.addEventListener("touchstart", (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", (e) => {
        if (inicioX === null) return;
        const dx = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
        inicioX = null;
    });

    visor.addEventListener("close", () => botones[actual].focus());
})();
