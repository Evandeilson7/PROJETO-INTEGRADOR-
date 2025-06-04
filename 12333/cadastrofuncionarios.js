const restritas = ["Gerente", "Analista de dados", "Responsavel"];
let funcionarios = JSON.parse(localStorage.getItem("funcionarios")) || [];
let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

function toggleForm(tipo) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("cadastroForm").classList.add("hidden");
  if (tipo === 'login') {
    document.getElementById("loginForm").classList.remove("hidden");
  } else {
    document.getElementById("cadastroForm").classList.remove("hidden");
  }
  document.getElementById("mensagem").innerText = "";
}

document.getElementById("cadastroForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const setor = document.getElementById("Setor").value;
  const funcao = document.getElementById("funcao").value;
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const msg = document.getElementById("mensagem");
  msg.className = "mensagem";

  if (senha !== confirmarSenha) {
    msg.classList.add("red");
    msg.innerText = "As senhas não coincidem.";
    return;
  }

  if (funcionarios.some(f => f.usuario === usuario)) {
    msg.classList.add("red");
    msg.innerText = "Usuário já existe.";
    return;
  }

  if (restritas.includes(funcao)) {
    notificacoes.push({ nome, setor, funcao, usuario, data: new Date().toLocaleString() });
    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
    msg.classList.add("orange");
    msg.innerText = `Função "${funcao}" requer aprovação. Solicitação enviada.`;
    return;
  }

  funcionarios.push({ nome, setor, funcao, usuario, senha });
  localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
  msg.classList.add("green");
  msg.innerText = "Cadastro realizado com sucesso!";
  document.getElementById("cadastroForm").reset();
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const usuarioLogin = document.getElementById("usuarioLogin").value.trim();
  const senhaLogin = document.getElementById("senhaLogin").value;
  const msg = document.getElementById("mensagem");
  msg.className = "mensagem";

  const funcionario = funcionarios.find(f => f.usuario === usuarioLogin && f.senha === senhaLogin);
  if (funcionario) {
    msg.classList.add("green");
    msg.innerText = "Login realizado com sucesso!";
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } else {
    msg.classList.add("red");
    msg.innerText = "Usuário ou senha incorretos.";
  }
});
