// Função para inicializar o gráfico de acessos
function initLoginChart() {
  const loginsPorDia = JSON.parse(localStorage.getItem("loginsPorDia")) || [0, 0, 0, 0, 0, 0, 0]; // [Dom, Seg, Ter, Qua, Qui, Sex, Sab]

  // Gráfico de Barras de Acessos
  const ctx = document.getElementById("loginChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'], // Dias da semana
      datasets: [{
        label: 'Número de Logins',
        data: loginsPorDia,
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Cor do gráfico
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Função para registrar logins por dia
function registrarLoginPorDia() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Retorna o dia da semana (0 a 6)

  // Recupera os logins por dia do localStorage
  let loginsPorDia = JSON.parse(localStorage.getItem("loginsPorDia")) || [0, 0, 0, 0, 0, 0, 0];

  // Incrementa o número de logins para o dia atual
  loginsPorDia[dayOfWeek]++;

  // Atualiza os logins por dia no localStorage
  localStorage.setItem("loginsPorDia", JSON.stringify(loginsPorDia));

  // Atualiza o gráfico
  initLoginChart();
}

// Incrementa o contador de logins
function incrementarLogins() {
  let logins = JSON.parse(localStorage.getItem("logins")) || 0;
  logins++;
  localStorage.setItem("logins", JSON.stringify(logins));
}

// Login de usuário
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    alert("Login bem-sucedido! Redirecionando...");
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Incrementa o contador de logins
    incrementarLogins();

    // Registra o login no gráfico de acessos
    registrarLoginPorDia();

    // Redireciona para a página de análise se for admin
    if (usuario.email === "admin@exemplo.com") {
      window.location.href = "analise.html";
    } else {
      window.location.href = "teste.html";
    }

  } else {
    alert("Email ou senha incorretos.");
  }
});
// Função para registrar login por dia
function registrarLoginPorDia() {
  const hoje = new Date().getDay(); // 0 = Domingo, 6 = Sábado
  let loginsPorDia = JSON.parse(localStorage.getItem("loginsPorDia")) || [0, 0, 0, 0, 0, 0, 0];
  loginsPorDia[hoje]++;
  localStorage.setItem("loginsPorDia", JSON.stringify(loginsPorDia));
}

// Função para incrementar total de logins
function incrementarLoginsTotais() {
  let logins = JSON.parse(localStorage.getItem("logins")) || 0;
  logins++;
  localStorage.setItem("logins", JSON.stringify(logins));
}

// Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    alert("Login bem-sucedido! Redirecionando...");
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Registra login
    registrarLoginPorDia();
    incrementarLoginsTotais();

    // Redirecionamento
    if (usuario.email === "admin@exemplo.com") {
      window.location.href = "analise.html";
    } else {
      window.location.href = "teste.html";
    }

  } else {
    alert("Email ou senha incorretos.");
  }
});
