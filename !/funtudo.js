function registrarLoginPorDia() {
  const hoje = new Date().getDay(); 
  let loginsPorDia = JSON.parse(localStorage.getItem("loginsPorDia")) || [0, 0, 0, 0, 0, 0, 0];
  loginsPorDia[hoje]++;
  localStorage.setItem("loginsPorDia", JSON.stringify(loginsPorDia));
}

function incrementarLoginsTotais() {
  let logins = JSON.parse(localStorage.getItem("logins")) || 0;
  logins++;
  localStorage.setItem("logins", JSON.stringify(logins));
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    alert("Login bem-sucedido! Redirecionando...");
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    registrarLoginPorDia();
    incrementarLoginsTotais();

    if (usuario.email === "admin@exemplo.com") {
      window.location.href = "analise.html";
    } else {
      window.location.href = "teste.html";
    }

  } else {
    alert("Email ou senha incorretos.");
  }
});
