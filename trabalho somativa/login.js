let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let logins = JSON.parse(localStorage.getItem('logins')) || 0;

function toggleForm(form) {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('clienteForm').classList.add('hidden');
  if (form === 'login') {
    document.getElementById('loginForm').classList.remove('hidden');
  } else {
    document.getElementById('clienteForm').classList.remove('hidden');
  }
}

document.getElementById("clienteForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const senha = document.getElementById("senhaCliente").value;
  const confirmarSenha = document.getElementById("confirmarSenhaCliente").value;

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  const cliente = {
    nome: document.getElementById("nomeCliente").value,
    cpf: document.getElementById("cpfCliente").value,
    telefone: document.getElementById("telefoneCliente").value,
    email: document.getElementById("emailCliente").value,
    endereco: document.getElementById("enderecoCliente").value,
    cep: document.getElementById("cepCliente").value,
    numeroCasa: document.getElementById("numeroCasaCliente").value,
    usuario: document.getElementById("usuarioCliente").value,
    senha: senha
  };

  if (clientes.some(c => c.usuario === cliente.usuario)) {
    alert("Usuário já cadastrado. Escolha outro usuário.");
    return;
  }

  clientes.push(cliente);
  localStorage.setItem('clientes', JSON.stringify(clientes));

  window.location.href = "sucesso.html";
});

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const usuarioLogin = document.getElementById("usuarioLogin").value;
  const senhaLogin = document.getElementById("senhaLogin").value;

  const usuario = clientes.find(cliente => cliente.usuario === usuarioLogin && cliente.senha === senhaLogin);

  if (usuario) {
    logins += 1;
    localStorage.setItem('logins', JSON.stringify(logins));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario)); 
    alert("Login efetuado com sucesso!");
    window.location.href = 'pagamento.html';  
  } else {
    alert("Usuário ou senha incorretos.");
  }
});
