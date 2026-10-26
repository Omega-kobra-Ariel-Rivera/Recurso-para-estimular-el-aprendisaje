// Página de contacto: formulario (EmailJS) y opiniones (Firebase)

const CONFIG = {
    emailjs: {
        publicKey: "e6wPRzH5yHEGwSQI2",
        servicio: "default_service",
        plantillaContacto: "template_47b6twm",
        // Aviso de nueva opinión (si la plantilla no existe, la opinión se publica igual)
        servicioOpinion: "gmail_service",
        plantillaOpinion: "comentario_template",
        correoAviso: "aprendizajedientedeleon2021@gmail.com"
    },
    firebase: {
        apiKey: "AIzaSyByL42CpoB1CPB0mjn3NpjgL3h11qfpGcY",
        authDomain: "barbara-caballero.firebaseapp.com",
        databaseURL: "https://barbara-caballero-default-rtdb.firebaseio.com",
        projectId: "barbara-caballero",
        storageBucket: "barbara-caballero.appspot.com",
        messagingSenderId: "147385239557",
        appId: "1:147385239557:web:a13af3e500b3d80fba346c"
    },
    opinionesPorPagina: 5
};

// ---------- Utilidades ----------
function mostrarAviso(form, texto, tipo) {
    const aviso = form.querySelector(".aviso");
    aviso.textContent = texto;
    aviso.className = "aviso " + (tipo === "ok" ? "aviso-ok" : "aviso-error");
    aviso.hidden = false;
}

function marcarError(input, mensaje) {
    const span = document.getElementById("error-" + input.id);
    input.setAttribute("aria-invalid", mensaje ? "true" : "false");
    if (span) span.textContent = mensaje || "";
    if (mensaje) input.setAttribute("aria-describedby", span ? span.id : "");
}

function validar(input) {
    const valor = input.value.trim();
    if (input.required && !valor) {
        marcarError(input, "Completa este campo.");
        return false;
    }
    if (input.type === "email" && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        marcarError(input, "Escribe un correo válido, por ejemplo nombre@gmail.com.");
        return false;
    }
    marcarError(input, "");
    return true;
}

function validarFormulario(form) {
    const campos = Array.from(form.querySelectorAll("input[required], textarea[required]"));
    const malos = campos.filter((c) => !validar(c));
    if (malos.length) malos[0].focus();
    return malos.length === 0;
}

function conTiempoLimite(promesa, ms) {
    return Promise.race([
        promesa,
        new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("tiempo agotado")), ms))
    ]);
}

// ---------- EmailJS ----------
const hayEmailJS = typeof emailjs !== "undefined";
if (hayEmailJS) emailjs.init({ publicKey: CONFIG.emailjs.publicKey });

// ---------- Formulario de contacto ----------
(function () {
    const form = document.getElementById("form-contacto");
    if (!form) return;
    const boton = form.querySelector('button[type="submit"]');

    form.querySelectorAll("input[required], textarea[required]").forEach((c) => {
        c.addEventListener("blur", () => validar(c));
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (form.sitio_web.value) return; // trampa para robots de spam
        if (!validarFormulario(form)) return;

        if (!hayEmailJS) {
            mostrarAviso(form, "No se pudo cargar el servicio de correo. Escríbeme por WhatsApp.", "error");
            return;
        }

        const fecha = form.time.value
            ? new Date(form.time.value).toLocaleString("es-CL", { dateStyle: "full", timeStyle: "short" })
            : "Sin preferencia";

        const mensaje =
            `Motivo: ${form.motivo.value}\n` +
            `Teléfono: ${form.telefono.value.trim() || "No indicado"}\n\n` +
            form.message.value.trim();

        boton.disabled = true;
        boton.textContent = "Enviando…";

        try {
            await conTiempoLimite(emailjs.send(CONFIG.emailjs.servicio, CONFIG.emailjs.plantillaContacto, {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                reply_to: form.email.value.trim(),
                time: fecha,
                message: mensaje
            }), 15000);
            form.reset();
            mostrarAviso(form, "Mensaje enviado. Te responderé a tu correo lo antes posible.", "ok");
        } catch (err) {
            console.error("EmailJS:", err);
            mostrarAviso(form, "El mensaje no se envió. Revisa tu conexión e inténtalo de nuevo, o escríbeme por WhatsApp.", "error");
        } finally {
            boton.disabled = false;
            boton.textContent = "Enviar mensaje";
        }
    });
})();

// ---------- Opiniones (Firebase) ----------
(function () {
    const lista = document.getElementById("lista-opiniones");
    const form = document.getElementById("form-opinion");
    const verMas = document.getElementById("ver-mas");
    if (!lista || !form) return;

    if (typeof firebase === "undefined") {
        lista.innerHTML = '<p class="vacio">No se pudieron cargar las opiniones. Recarga la página para intentarlo de nuevo.</p>';
        form.hidden = true;
        return;
    }

    firebase.initializeApp(CONFIG.firebase);
    const db = firebase.database();
    const ref = db.ref("comentarios");

    let opiniones = [];
    let visibles = CONFIG.opinionesPorPagina;

    // Me gusta: se recuerda en este navegador para no repetirlo
    function leerGustados() {
        try { return JSON.parse(localStorage.getItem("opiniones-gustadas") || "[]"); }
        catch (e) { return []; }
    }
    function guardarGustado(id) {
        try {
            const g = leerGustados();
            if (!g.includes(id)) g.push(id);
            localStorage.setItem("opiniones-gustadas", JSON.stringify(g));
        } catch (e) { /* sin almacenamiento: no pasa nada */ }
    }

    function el(tag, texto, clase) {
        const n = document.createElement(tag);
        if (texto !== undefined) n.textContent = texto;
        if (clase) n.className = clase;
        return n;
    }

    function pintar() {
        lista.innerHTML = "";
        if (!opiniones.length) {
            lista.appendChild(el("p", "Aún no hay opiniones. Si participaste en un taller o sesión, cuéntanos cómo te fue.", "vacio"));
            verMas.hidden = true;
            return;
        }

        const gustados = leerGustados();

        opiniones.slice(0, visibles).forEach((op) => {
            const art = el("article", undefined, "opinion");

            const cabeza = el("div", undefined, "opinion-cabeza");
            cabeza.appendChild(el("strong", op.nombre || "Anónimo"));
            if (op.timestamp) {
                const t = el("time", new Date(op.timestamp).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }));
                t.dateTime = op.timestamp;
                cabeza.appendChild(t);
            }
            art.appendChild(cabeza);
            art.appendChild(el("p", op.comentario || ""));

            if (op.replies) {
                Object.values(op.replies).forEach((r) => {
                    const resp = el("div", undefined, "respuesta");
                    resp.appendChild(el("strong", (r.nombre || "Anónimo") + ": "));
                    resp.appendChild(document.createTextNode(r.comentario || ""));
                    art.appendChild(resp);
                });
            }

            const yaGusta = gustados.includes(op.id);
            const gusta = el("button", `♥ ${op.likes || 0}`, "me-gusta");
            gusta.type = "button";
            gusta.setAttribute("aria-pressed", String(yaGusta));
            gusta.setAttribute("aria-label", `Me gusta, ${op.likes || 0}`);
            if (yaGusta) gusta.disabled = true;
            gusta.addEventListener("click", () => {
                gusta.disabled = true;
                guardarGustado(op.id);
                ref.child(op.id + "/likes").transaction((v) => (v || 0) + 1);
            });
            art.appendChild(gusta);

            lista.appendChild(art);
        });

        verMas.hidden = opiniones.length <= visibles;
    }

    verMas.addEventListener("click", () => {
        visibles += CONFIG.opinionesPorPagina;
        pintar();
    });

    ref.on("value", (snap) => {
        opiniones = [];
        snap.forEach((hijo) => {
            const v = hijo.val() || {};
            if (v.comentario) opiniones.push({ id: hijo.key, ...v });
        });
        opiniones.sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")));
        pintar();
    }, (err) => {
        console.error("Firebase:", err);
        lista.innerHTML = '<p class="vacio">No se pudieron cargar las opiniones en este momento.</p>';
    });

    const boton = form.querySelector('button[type="submit"]');
    const nombre = document.getElementById("op-nombre");
    const texto = document.getElementById("op-texto");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validarFormulario(form)) return;

        // Evita publicar muchas opiniones seguidas desde el mismo navegador
        try {
            const ultima = Number(localStorage.getItem("ultima-opinion") || 0);
            if (Date.now() - ultima < 60000) {
                mostrarAviso(form, "Ya publicaste una opinión hace un momento. Espera un minuto para publicar otra.", "error");
                return;
            }
        } catch (err) { /* sin almacenamiento */ }

        const datos = {
            nombre: nombre.value.trim().slice(0, 60),
            comentario: texto.value.trim().slice(0, 600),
            timestamp: new Date().toISOString(),
            likes: 0
        };

        boton.disabled = true;
        boton.textContent = "Publicando…";

        try {
            await conTiempoLimite(ref.push(datos), 15000);
            try { localStorage.setItem("ultima-opinion", String(Date.now())); } catch (err) { /* */ }
            form.reset();
            mostrarAviso(form, "Opinión publicada. ¡Gracias por compartir tu experiencia!", "ok");

            if (hayEmailJS) {
                emailjs.send(CONFIG.emailjs.servicioOpinion, CONFIG.emailjs.plantillaOpinion, {
                    to_email: CONFIG.emailjs.correoAviso,
                    nombre: datos.nombre,
                    comentario: datos.comentario
                }).catch((err) => console.warn("Aviso de opinión no enviado:", err));
            }
        } catch (err) {
            console.error("Firebase:", err);
            mostrarAviso(form, "La opinión no se publicó. Revisa tu conexión e inténtalo de nuevo.", "error");
        } finally {
            boton.disabled = false;
            boton.textContent = "Publicar opinión";
        }
    });
})();
