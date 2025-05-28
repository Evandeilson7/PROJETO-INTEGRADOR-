// Função para carregar os cadastros, notificações e histórico
function carregarTudo() {
    carregarCadastros();
    carregarNotificacoes();
    carregarHistorico();
  }
  
  // Carregar cadastros que já foram aprovados
  function carregarCadastros() {
    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
    const lista = document.getElementById("cadastrosLista");
    lista.innerHTML = "";
  
    if (cadastros.length === 0) {
      lista.innerHTML = "<p class='vazio'>Nenhum cadastro disponível.</p>";
      return;
    }
  
    cadastros.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "cadastro-item";
      div.innerHTML = `
        <span>${item[0]} — ${item[1]} | CPF: ${item[2]} | Setor: ${item[3]}</span>
        <button onclick="removerCadastro(${index})">Remover</button>
      `;
      lista.appendChild(div);
  
      // Exibe com efeito fade-in após carregamento
      setTimeout(() => div.classList.add('show'), 100); // Fade-in
    });
  }
  
  // Carregar as notificações pendentes (solicitações de cargos restritos)
  function carregarNotificacoes() {
    let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
    const lista = document.getElementById("notificacoesLista");
    lista.innerHTML = "";
  
    if (notificacoes.length === 0) {
      lista.innerHTML = "<p class='vazio'>Nenhuma solicitação pendente.</p>";
      return;
    }
  
    notificacoes.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "notificacao-item";
      div.innerHTML = `
        <span>${item.nome} solicitou função <strong>${item.funcao}</strong> em ${item.data}</span>
        <button onclick="aprovarCadastro(${index})">Aprovar</button>
        <button onclick="removerNotificacao(${index})">Remover</button>
      `;
      lista.appendChild(div);
  
      // Exibe com efeito fade-in após carregamento
      setTimeout(() => div.classList.add('show'), 100); // Fade-in
    });
  }
  
  // Carregar o histórico de cadastros removidos
  function carregarHistorico() {
    let historico = JSON.parse(localStorage.getItem("historico")) || [];
    const lista = document.getElementById("historicoLista");
    lista.innerHTML = "";
  
    if (historico.length === 0) {
      lista.innerHTML = "<p class='vazio'>Nenhuma remoção registrada.</p>";
      return;
    }
  
    historico.forEach((item) => {
      const div = document.createElement("div");
      div.className = "historico-item";
      div.innerHTML = `
        <span>${item.nome} foi removido — Função: ${item.funcao} | CPF: ${item.cpf} | Setor: ${item.setor}</span>
      `;
      lista.appendChild(div);
  
      // Exibe com efeito fade-in após carregamento
      setTimeout(() => div.classList.add('show'), 100); // Fade-in
    });
  }
  
  // Aprovar cadastro e adicionar ao banco de dados de cadastros
  function aprovarCadastro(index) {
    let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
  
    const itemAprovado = notificacoes[index];
    cadastros.push([itemAprovado.nome, itemAprovado.funcao, itemAprovado.cpf, itemAprovado.sexo]);
    localStorage.setItem("cadastros", JSON.stringify(cadastros));
  
    // Remover a notificação após aprovação
    notificacoes.splice(index, 1);
    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
  
    // Atualizar listas
    carregarTudo();
  
    const msg = document.getElementById("mensagem");
    msg.innerText = `Cadastro de ${itemAprovado.nome} aprovado!`;
    msg.style.color = "#2ecc71";
  }
  
  // Remover notificação sem aprovar
  function removerNotificacao(index) {
    let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
    notificacoes.splice(index, 1);
    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
  
    // Atualizar listas
    carregarTudo();
  
    const msg = document.getElementById("mensagem");
    msg.innerText = "Notificação removida.";
    msg.style.color = "#ff5e57";
  }
  
  // Remover cadastro da lista de cadastros e transferir para o histórico
  function removerCadastro(index) {
    let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
    let historico = JSON.parse(localStorage.getItem("historico")) || [];
  
    const itemRemovido = cadastros[index];
  
    // Adiciona o cadastro removido ao histórico
    historico.push({
      nome: itemRemovido[0],
      funcao: itemRemovido[1],
      cpf: itemRemovido[2],
      setor: itemRemovido[3]
    });
  
    // Atualiza o histórico no localStorage
    localStorage.setItem("historico", JSON.stringify(historico));
  
    // Remove o cadastro da lista
    cadastros.splice(index, 1);
    localStorage.setItem("cadastros", JSON.stringify(cadastros));
  
    // Atualizar lista
    carregarTudo();
  
    const msg = document.getElementById("mensagem");
    msg.innerText = "Cadastro removido e transferido para o histórico.";
    msg.style.color = "#ff5e57";
  }
  
  // Carregar tudo quando a página for carregada
  window.onload = carregarTudo;
  