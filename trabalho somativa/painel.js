function mostrarPainel(painel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById(`painel-${painel}`).classList.add('active');
  event.target.classList.add('active');
}

function loadClientData() {
  const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  const tbody = document.getElementById('clientTableBody');
  tbody.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const c = clientes[i];
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${c ? c.nome : '-'}</td>
        <td>${c ? c.telefone : '-'}</td>
        <td>${c ? c.email : '-'}</td>
        <td>${c ? `${c.endereco}, Nº ${c.numeroCasa} - CEP: ${c.cep}` : '-'}</td>
      </tr>`;
  }
}

function expandClientInfo() {
  const div = document.getElementById("clientDetails");
  div.classList.toggle("hidden");
  loadClientData();
}

function apagarDadosClientes() {
  if (confirm("Deseja apagar os dados dos clientes?")) {
    localStorage.removeItem("clientes");
    loadClientData();
    alert("Dados apagados.");
  }
}

function mostrarMensagem(txt, cor) {
  const msg = document.getElementById("mensagem");
  msg.innerText = txt;
  msg.style.color = cor;
}

function carregarCadastros() {
  const cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
  const lista = document.getElementById("cadastrosLista");
  lista.innerHTML = cadastros.length === 0 ? "<p class='vazio'>Nenhum cadastro.</p>" : "";
  cadastros.forEach((c, i) => {
    lista.innerHTML += `
      <div class="item">
        <span><strong>${c[0]}</strong> - Função: ${c[1]} - CPF: ${c[2]} - Setor: ${c[3]}</span>
        <button class="small" onclick="removerCadastro(${i})">Remover</button>
      </div>`;
  });
}

function carregarNotificacoes() {
  const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
  const lista = document.getElementById("notificacoesLista");
  lista.innerHTML = notificacoes.length === 0 ? "<p class='vazio'>Nenhuma solicitação.</p>" : "";
  notificacoes.forEach((n, i) => {
    lista.innerHTML += `
      <div class="item">
        <span>${n.nome} solicitou função ${n.funcao} (Data: ${n.data})</span>
        <button class="small" onclick="aprovarCadastro(${i})">Aprovar</button>
        <button class="small" onclick="removerNotificacao(${i})">Remover</button>
      </div>`;
  });
}

function carregarHistorico() {
  const historico = JSON.parse(localStorage.getItem("historico")) || [];
  const lista = document.getElementById("historicoLista");
  lista.innerHTML = historico.length === 0 ? "<p class='vazio'>Nada registrado.</p>" : "";
  historico.forEach(h => {
    lista.innerHTML += `
      <div class="item">
        <span>${h.nome} foi removido - Função: ${h.funcao}, CPF: ${h.cpf}, Setor: ${h.setor}</span>
      </div>`;
  });
}

function aprovarCadastro(index) {
  let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
  let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
  const item = notificacoes[index];
  cadastros.push([item.nome, item.funcao, item.cpf, item.sexo]);
  notificacoes.splice(index, 1);
  localStorage.setItem("cadastros", JSON.stringify(cadastros));
  localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
  carregarTudoResponsavel();
  mostrarMensagem(`Aprovado: ${item.nome}`, "#2ecc71");
}

function removerNotificacao(index) {
  let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
  notificacoes.splice(index, 1);
  localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
  carregarTudoResponsavel();
  mostrarMensagem("Notificação removida", "#ff5e57");
}

function removerCadastro(index) {
  if (!confirm("Remover cadastro?")) return;
  let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
  const item = cadastros[index];
  historico.push({ nome: item[0], funcao: item[1], cpf: item[2], setor: item[3] });
  cadastros.splice(index, 1);
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("cadastros", JSON.stringify(cadastros));
  carregarTudoResponsavel();
  mostrarMensagem("Cadastro removido e arquivado.", "#f39c12");
}

function carregarTudoResponsavel() {
  carregarCadastros();
  carregarNotificacoes();
  carregarHistorico();
}

carregarTudoResponsavel();
