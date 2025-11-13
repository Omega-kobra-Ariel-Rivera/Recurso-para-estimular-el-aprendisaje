const btn = document.getElementById('button');

document.getElementById('form')
    .addEventListener('submit', function(event) {
        event.preventDefault();

        btn.value = 'Sending...';

        const serviceID = 'default_service';
        const templateID = 'template_47b6twm';

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                btn.value = 'Enviar';
                alert('Mensaje Enviado!');
            }, (err) => {
                btn.value = 'Mensaje Enviado';
                alert(JSON.stringify(err));
            });
    });

// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyByL42CpoB1CPB0mjn3NpjgL3h11qfpGcY",
    authDomain: "barbara-caballero.firebaseapp.com",
    databaseURL: "https://barbara-caballero-default-rtdb.firebaseio.com",
    projectId: "barbara-caballero",
    storageBucket: "barbara-caballero.appspot.com",
    messagingSenderId: "147385239557",
    appId: "1:147385239557:web:a13af3e500b3d80fba346c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EmailJS
emailjs.init("e6wPRzH5yHEGwSQI2"); // Reemplaza por tu User ID

document.getElementById("commentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const comentario = document.getElementById("comentario").value;
    const timestamp = new Date().toISOString();

    const newCommentRef = db.ref("comentarios").push();
    newCommentRef.set({ nombre, comentario, timestamp, likes: 0 });

    // Enviar correo a Gmail
    emailjs.send("gmail_service", "comentario_template", {
        to_email: "aprendizajedeleon2021@gmail.com",
        nombre,
        comentario
    });

    this.reset();
});

function cargarComentarios() {
    db.ref("comentarios").on("value", function(snapshot) {
        const comentariosDiv = document.getElementById("comentarios");
        comentariosDiv.innerHTML = '';

        snapshot.forEach(function(childSnapshot) {
            const data = childSnapshot.val();
            const key = childSnapshot.key;
            const fecha = new Date(data.timestamp).toLocaleString();

            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `
        <p><strong>${data.nombre}</strong> <em>${fecha}</em></p>
        <p>${data.comentario}</p>
        <button onclick="likeComment('${key}')">👍 ${data.likes || 0}</button>
        <button onclick="dislikeComment('${key}')">👎</button>
        <button onclick="deleteComment('${key}')">🗑️</button>
        <div>
          <textarea id="reply-${key}" placeholder="Responder..." rows="2"></textarea>
          <button onclick="replyToComment('${key}')">Responder</button>
        </div>
        <div id="replies-${key}"></div>
      `;

            comentariosDiv.appendChild(div);

            if (data.replies) {
                Object.values(data.replies).forEach((reply) => {
                    const r = document.createElement("div");
                    r.className = "reply";
                    r.innerHTML = `<strong>${reply.nombre}</strong>: ${reply.comentario}`;
                    document.getElementById(`replies-${key}`).appendChild(r);
                });
            }
        });
    });
}

function likeComment(key) {
    const ref = db.ref(`comentarios/${key}/likes`);
    ref.transaction((val) => (val || 0) + 1);
}

function dislikeComment(key) {
    const ref = db.ref(`comentarios/${key}/likes`);
    ref.transaction((val) => Math.max((val || 0) - 1, 0));
}

function deleteComment(key) {
    if (confirm("¿Seguro que quieres borrar este comentario?")) {
        db.ref("comentarios/" + key).remove();
    }
}

function replyToComment(key) {
    const nombre = prompt("Tu nombre para responder:");
    const comentario = document.getElementById(`reply-${key}`).value;
    if (!nombre || !comentario) return;
    const timestamp = new Date().toISOString();
    db.ref(`comentarios/${key}/replies`).push({ nombre, comentario, timestamp });
    document.getElementById(`reply-${key}`).value = "";
}

cargarComentarios();