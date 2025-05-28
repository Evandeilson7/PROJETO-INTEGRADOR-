const restritas = ["Gerente", "Analista de dados", "Responsavel"];
let cadastros = JSON.parse(localStorage.getItem("cadastros")) || [];
let notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

function adicionarCadastro() {
  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("CPF").value.trim();
  const sexo = document.getElementById("Setor").value;
  const funcao = document.getElementById("funcao").value;
  const msg = document.getElementById("mensagem");

  msg.className = "mensagem";

  if (!nome || !cpf) {
    msg.classList.add("red");
    msg.innerText = "Por favor, preencha todos os campos corretamente.";
    return;
  }

  if (restritas.includes(funcao)) {
    notificacoes.push({
      nome,
      cpf,
      sexo,
      funcao,
      data: new Date().toLocaleString()
    });
    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
    msg.classList.add("orange");
    msg.innerText = `Função "${funcao}" requer aprovação. Solicitação enviada ao Responsável.`;
    document.getElementById("nome").value = "";
    document.getElementById("CPF").value = "";
    return;
  }

  cadastros.push([nome, cpf, sexo, funcao]);
  localStorage.setItem("cadastros", JSON.stringify(cadastros));
  msg.classList.add("green");
  msg.innerText = "Cadastro realizado com sucesso!";
  document.getElementById("nome").value = "";
  document.getElementById("CPF").value = "";
}
