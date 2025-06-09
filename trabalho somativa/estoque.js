
// Dados iniciais
let estoque = {
  produtos: [],
  movimentacoes: []
};

// Elementos do DOM
const formProduto = document.getElementById('formProduto');
const formMovimentacao = document.getElementById('formMovimentacao');
const tabelaProdutos = document.querySelector('#tabelaProdutos tbody');
const selectProduto = document.getElementById('selectProduto');
const btnCancelar = document.getElementById('btnCancelar');

let grafico;
let tipoGrafico = 'bar';
let dataFiltroInicio = null;
let dataFiltroFim = null;

// Carregar dados do localStorage ou arquivo JSON inicial
function carregarDados() {
  const dadosSalvos = localStorage.getItem('estoque');
  if (dadosSalvos) {
    estoque = JSON.parse(dadosSalvos);
  } else {
    fetch('data.json')
      .then(response => response.json())
      .then(dados => {
        estoque = dados;
        salvarNoLocalStorage();
      })
      .catch(() => {
        estoque = { produtos: [], movimentacoes: [] };
      });
  }
  atualizarInterface();
}

// Atualiza toda interface
function atualizarInterface() {
  atualizarTabela();
  atualizarSelectProdutos();
  atualizarGrafico();
  verificarEstoqueBaixo();
}

// Salvar no localStorage
function salvarNoLocalStorage() {
  localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Adicionar produto
function adicionarProduto(produto) {
  if (estoque.produtos.some(p => p.codigo === produto.codigo)) {
    mostrarFeedback(`Código ${produto.codigo} já existe!`, 'error');
    return;
  }
  produto.id = Date.now().toString();
  produto.quantidade = parseInt(produto.quantidade) || 0;
  produto.preco = parseFloat(produto.preco) || 0;
  estoque.produtos.push(produto);
  salvarNoLocalStorage();
  atualizarInterface();
  mostrarFeedback(`Produto ${produto.nome} adicionado com sucesso!`, 'success');
}

// Atualizar produto existente
function atualizarProduto(produtoAtualizado) {
  const index = estoque.produtos.findIndex(p => p.id === produtoAtualizado.id);
  if (index !== -1) {
    if (
      estoque.produtos.some(
        p => p.codigo === produtoAtualizado.codigo && p.id !== produtoAtualizado.id
      )
    ) {
      mostrarFeedback(`Código ${produtoAtualizado.codigo} já existe!`, 'error');
      return;
    }
    produtoAtualizado.quantidade = parseInt(produtoAtualizado.quantidade) || 0;
    produtoAtualizado.preco = parseFloat(produtoAtualizado.preco) || 0;
    estoque.produtos[index] = produtoAtualizado;
    salvarNoLocalStorage();
    atualizarInterface();
    mostrarFeedback(`Produto ${produtoAtualizado.nome} atualizado com sucesso!`, 'success');
  }
}

// Excluir produto
function excluirProduto(id) {
  const produto = estoque.produtos.find(p => p.id === id);
  if (produto && confirm(`Tem certeza que deseja excluir o produto ${produto.nome}?`)) {
    estoque.produtos = estoque.produtos.filter(p => p.id !== id);
    estoque.movimentacoes = estoque.movimentacoes.filter(m => m.produtoId !== id);
    salvarNoLocalStorage();
    atualizarInterface();
    mostrarFeedback(`Produto ${produto.nome} excluído com sucesso!`, 'warning');
  }
}

// Editar produto - preencher formulário
function editarProduto(id) {
  const produto = estoque.produtos.find(p => p.id === id);
  if (!produto) return;
  document.getElementById('produtoId').value = produto.id;
  document.getElementById('nome').value = produto.nome;
  document.getElementById('codigo').value = produto.codigo;
  document.getElementById('quantidade').value = produto.quantidade;
  document.getElementById('preco').value = produto.preco;
  document.getElementById('localizacao').value = produto.localizacao;
  btnCancelar.style.display = 'inline-block';
  document.getElementById('formProduto').scrollIntoView({ behavior: 'smooth' });
}

// Registrar movimentação e atualizar estoque
function registrarMovimentacao(movimentacao) {
  const produto = estoque.produtos.find(p => p.id === movimentacao.produtoId);
  if (!produto) throw new Error('Produto não encontrado!');
  movimentacao.quantidade = parseInt(movimentacao.quantidade) || 0;
  if (movimentacao.quantidade <= 0) throw new Error('A quantidade deve ser maior que zero!');
  const isTransferencia =
    movimentacao.tipo === 'saida' &&
    movimentacao.localizacaoDestino &&
    movimentacao.localizacaoDestino !== produto.localizacao;
  if (movimentacao.tipo === 'entrada') {
    produto.quantidade += movimentacao.quantidade;
  } else {
    if (movimentacao.quantidade > produto.quantidade) {
      throw new Error(`Quantidade em estoque insuficiente! Disponível: ${produto.quantidade}`);
    }
    produto.quantidade -= movimentacao.quantidade;
    if (isTransferencia) {
      produto.localizacao = movimentacao.localizacaoDestino;
    }
  }
  movimentacao.id = Date.now().toString();
  movimentacao.data = new Date().toISOString();
  movimentacao.produtoNome = produto.nome;
  movimentacao.produtoCodigo = produto.codigo;
  estoque.movimentacoes.push(movimentacao);
  salvarNoLocalStorage();
  atualizarInterface();
  mostrarFeedback(
    `Movimentação registrada: ${produto.nome} (${movimentacao.tipo} ${movimentacao.quantidade})`,
    'success'
  );
}

// Atualizar a tabela de produtos
function atualizarTabela() {
  tabelaProdutos.innerHTML = '';
  estoque.produtos.forEach((produto) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td data-label="Nome">${produto.nome}</td>
            <td data-label="Código">${produto.codigo}</td>
            <td data-label="Quantidade">${produto.quantidade}</td>
            <td data-label="Preço">R$ ${produto.preco.toFixed(2)}</td>
            <td data-label="Localização">${produto.localizacao}</td>
            <td data-label="Ações" class="acoes">
                <button onclick="editarProduto('${produto.id}')">✏️ Editar</button>
                <button onclick="excluirProduto('${produto.id}')">🗑️ Excluir</button>
                <button onclick="abrirModalRastreio('${produto.id}')">🚚 Rastrear</button>
            </td>
        `;
    if (produto.quantidade <= 5) {
      tr.classList.add('estoque-baixo');
      tr.querySelector('td:nth-child(3)').innerHTML += ' ⚠️';
    }
    tabelaProdutos.appendChild(tr);
  });
}

// Atualizar select produtos
function atualizarSelectProdutos() {
  selectProduto.innerHTML = '<option value="">Selecione...</option>';
  estoque.produtos.forEach((produto) => {
    const option = document.createElement('option');
    option.value = produto.id;
    option.textContent = `${produto.nome} (${produto.codigo}) - ${produto.quantidade} un`;
    selectProduto.appendChild(option);
  });
}

// Inicializar gráficos e eventos relacionados
function initGraficos() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      tipoGrafico = btn.dataset.chart;
      atualizarGrafico();
    });
  });

  document.getElementById('btnFiltrar').addEventListener('click', () => {
    const inicio = document.getElementById('dataInicio').value;
    const fim = document.getElementById('dataFim').value;
    dataFiltroInicio = inicio ? new Date(inicio) : null;
    dataFiltroFim = fim ? new Date(fim + 'T23:59:59') : null;
    if (dataFiltroInicio && dataFiltroFim && dataFiltroInicio > dataFiltroFim) {
      mostrarFeedback('A data inicial não pode ser maior que a final!', 'error');
      return;
    }
    atualizarGrafico();
  });

  document.getElementById('btnResetar').addEventListener('click', () => {
    document.getElementById('dataInicio').value = '';
    document.getElementById('dataFim').value = '';
    dataFiltroInicio = null;
    dataFiltroFim = null;
    atualizarGrafico();
  });

  document.getElementById('btnExportar').addEventListener('click', exportarDados);
  document.getElementById('btnImportar').addEventListener('click', () => {
    document.getElementById('inputImportar').click();
  });
  document.getElementById('inputImportar').addEventListener('change', importarDados);
}

// Atualizar gráfico com filtros e tipo
function atualizarGrafico() {
  const ctx = document.getElementById('graficoMovimentacoes').getContext('2d');
  let movimentacoes = estoque.movimentacoes;
  if (dataFiltroInicio || dataFiltroFim) {
    movimentacoes = movimentacoes.filter((mov) => {
      const dataMov = new Date(mov.data);
      return (
        (!dataFiltroInicio || dataMov >= dataFiltroInicio) &&
        (!dataFiltroFim || dataMov <= dataFiltroFim)
      );
    });
  }
  if (movimentacoes.length === 0) {
    if (grafico) grafico.destroy();
    mostrarFeedback('Nenhuma movimentação encontrada no período selecionado.', 'info');
    return;
  }
  let labels = [];
  let datasets = [];
  switch (tipoGrafico) {
    case 'bar':
      const dadosProdutos = {};
      movimentacoes.forEach((mov) => {
        const produto = estoque.produtos.find((p) => p.id === mov.produtoId) || { nome: 'Desconhecido', id: 'unknown' };
        if (!dadosProdutos[produto.id]) {
          dadosProdutos[produto.id] = {
            nome: produto.nome,
            entradas: 0,
            saidas: 0,
          };
        }
        if (mov.tipo === 'entrada') {
          dadosProdutos[produto.id].entradas += mov.quantidade;
        } else {
          dadosProdutos[produto.id].saidas += mov.quantidade;
        }
      });
      labels = Object.values(dadosProdutos).map((p) => p.nome);
      datasets = [
        {
          label: 'Entradas',
          data: Object.values(dadosProdutos).map((p) => p.entradas),
          backgroundColor: '#2563eb',
        },
        {
          label: 'Saídas',
          data: Object.values(dadosProdutos).map((p) => p.saidas),
          backgroundColor: '#ef4444',
        },
      ];
      break;
    case 'line':
      const dadosDatas = {};
      movimentacoes.forEach((mov) => {
        const data = mov.data.split('T')[0];
        if (!dadosDatas[data]) {
          dadosDatas[data] = { entradas: 0, saidas: 0 };
        }
        if (mov.tipo === 'entrada') {
          dadosDatas[data].entradas += mov.quantidade;
        } else {
          dadosDatas[data].saidas += mov.quantidade;
        }
      });
      labels = Object.keys(dadosDatas).sort();
      datasets = [
        {
          label: 'Entradas',
          data: labels.map((data) => dadosDatas[data].entradas),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Saídas',
          data: labels.map((data) => dadosDatas[data].saidas),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.3,
        },
      ];
      break;
  }
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: getTituloGrafico(),
        font: { size: 18 },
      },
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantidade',
        },
      },
      x: {
        title: {
          display: true,
          text: tipoGrafico === 'bar' ? 'Produtos' : 'Datas',
        },
      },
    },
  };
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: tipoGrafico,
    data: { labels, datasets },
    options,
  });
}

function getTituloGrafico() {
  let titulo = '';
  switch (tipoGrafico) {
    case 'bar':
      titulo = 'Entradas vs Saídas por Produto';
      break;
    case 'line':
      titulo = 'Histórico de Movimentações';
      break;
  }
  if (dataFiltroInicio || dataFiltroFim) titulo += ' (Filtrado)';
  return titulo;
}

// Exportar dados em JSON
function exportarDados() {
  const dados = JSON.stringify(estoque, null, 2);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-estoque-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  mostrarFeedback('Dados exportados com sucesso!', 'success');
}

// Importar dados JSON
function importarDados(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const dados = JSON.parse(event.target.result);
      if (dados.produtos && dados.movimentacoes) {
        if (confirm('Isso substituirá seus dados atuais. Continuar?')) {
          estoque = dados;
          salvarNoLocalStorage();
          atualizarInterface();
          mostrarFeedback('Dados importados com sucesso!', 'success');
        }
      } else {
        mostrarFeedback('Arquivo inválido. Formato incorreto.', 'error');
      }
    } catch {
      mostrarFeedback('Erro ao ler o arquivo. Verifique o formato.', 'error');
    }
  };
  reader.readAsText(file);
}

// Abrir modal rastreio com histórico e botão PDF
function abrirModalRastreio(produtoId) {
  const produto = estoque.produtos.find((p) => p.id === produtoId);
  if (!produto) return;
  const modal = document.getElementById('rastreio-modal');
  modal.dataset.produtoId = produtoId;
  const rastreioConteudo = document.getElementById('rastreio-conteudo');

  const movimentacoes = estoque.movimentacoes.filter((mov) => mov.produtoId === produtoId).sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

  if (movimentacoes.length === 0) {
    rastreioConteudo.innerHTML = `<p style="color:#6b7280; font-weight:500;">Nenhuma movimentação registrada para este produto.</p>`;
  } else {
    let html = `
      <button id="btnBaixarRelatorio" class="btn-pdf" style="margin-bottom:1rem;">
        <i class="fas fa-file-pdf"></i> Baixar Relatório Completo
      </button>
      <table role="table" aria-label="Histórico de movimentações">
        <thead>
          <tr>
            <th>Data</th>
            <th>Código</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
    `;

    movimentacoes.forEach((mov) => {
      html += `
        <tr>
          <td data-label="Data">${new Date(mov.data).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</td>
          <td data-label="Código">${produto.codigo}</td>
          <td data-label="Tipo">${mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}</td>
          <td data-label="Quantidade">${mov.quantidade}</td>
          <td data-label="Origem">${mov.localizacaoOrigem || '-'}</td>
          <td data-label="Destino">${mov.localizacaoDestino || '-'}</td>
          <td data-label="Motivo">${mov.motivo || '-'}</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    rastreioConteudo.innerHTML = html;

    document.getElementById('btnBaixarRelatorio').addEventListener('click', () => {
      gerarPDFRelatorioCompleto(produto, movimentacoes);
    });
  }
  modal.style.display = 'block';
}

// Gerar PDF com jsPDF e AutoTable
function gerarPDFRelatorioCompleto(produto, movimentacoes) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(`Relatório de Movimentações`, 14, 22);
  doc.setFontSize(14);
  doc.text(`Produto: ${produto.nome} (${produto.codigo})`, 14, 32);
  doc.text(`Quantidade atual: ${produto.quantidade}`, 14, 40);
  doc.text(`Localização atual: ${produto.localizacao}`, 14, 48);

  const headers = [['Data', 'Código', 'Tipo', 'Quantidade', 'Origem', 'Destino', 'Motivo']];
  const data = movimentacoes.map((mov) => [
    new Date(mov.data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    produto.codigo,
    mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1),
    mov.quantidade,
    mov.localizacaoOrigem || '-',
    mov.localizacaoDestino || '-',
    mov.motivo || '-',
  ]);

  if (doc.autoTable) {
    doc.autoTable({
      startY: 58,
      head: headers,
      body: data,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      margin: { top: 10 },
    });
  } else {
    doc.text('Navegador não suporta tabela PDF.', 14, 60);
  }

  doc.save(`relatorio-movimentacoes-${produto.codigo}.pdf`);
}

// Fechar modal
function fecharModalRastreio() {
  const modal = document.getElementById('rastreio-modal');
  modal.style.display = 'none';
}

// Notificação estoque baixo
function verificarEstoqueBaixo() {
  const produtosBaixos = estoque.produtos.filter((p) => p.quantidade <= 5);
  if (produtosBaixos.length > 0) {
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao-estoque';
    notificacao.innerHTML = `
      <span>⚠️ Estoque baixo em ${produtosBaixos.length} produto(s)</span>
      <button aria-label="Fechar notificação" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notificacao);
    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.remove();
      }
    }, 10000);
  }
}

// Feedback visual
function mostrarFeedback(mensagem, tipo = 'info') {
  const cores = {
    success: '#2563eb',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#6b7280',
  };
  const feedback = document.createElement('div');
  feedback.textContent = mensagem;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${cores[tipo] || '#6b7280'};
    color: white;
    padding: 1rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    font-size: 1rem;
    animation: fadeInOut 3s ease-in-out;
  `;
  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.remove();
  }, 3500);
}

// Debounce para busca
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Setup dos eventos
function setupEventListeners() {
  formProduto.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = {
      id: document.getElementById('produtoId').value || '',
      nome: formProduto.nome.value.trim(),
      codigo: formProduto.codigo.value.trim(),
      quantidade: parseInt(formProduto.quantidade.value) || 0,
      preco: parseFloat(formProduto.preco.value) || 0,
      localizacao: formProduto.localizacao.value.trim(),
    };
    try {
      if (dados.id) {
        atualizarProduto(dados);
      } else {
        adicionarProduto(dados);
      }
      formProduto.reset();
      document.getElementById('produtoId').value = '';
      btnCancelar.style.display = 'none';
    } catch (error) {
      mostrarFeedback(error.message, 'error');
    }
  });

  btnCancelar.addEventListener('click', () => {
    formProduto.reset();
    document.getElementById('produtoId').value = '';
    btnCancelar.style.display = 'none';
  });

  formMovimentacao.addEventListener('submit', (e) => {
    e.preventDefault();
    const movimentacao = {
      produtoId: formMovimentacao.produtoId.value,
      tipo: formMovimentacao.tipo.value,
      quantidade: parseInt(formMovimentacao.qtdMov.value) || 0,
      motivo: formMovimentacao.motivo.value.trim(),
      localizacaoOrigem: formMovimentacao.localizacaoOrigem.value.trim(),
      localizacaoDestino:
        formMovimentacao.localizacaoDestino.value === 'OUTRO'
          ? formMovimentacao.outraLocalizacao.value.trim()
          : formMovimentacao.localizacaoDestino.value.trim(),
    };
    if (!movimentacao.produtoId) {
      mostrarFeedback('Selecione um produto.', 'error');
      return;
    }
    if (movimentacao.quantidade <= 0) {
      mostrarFeedback('Quantidade inválida.', 'error');
      return;
    }
    if (movimentacao.tipo === 'saida' && !movimentacao.localizacaoDestino) {
      mostrarFeedback('Informe a localização de destino para transferência.', 'error');
      return;
    }
    try {
      registrarMovimentacao(movimentacao);
      formMovimentacao.reset();
    } catch (error) {
      mostrarFeedback(error.message, 'error');
    }
  });

  document.getElementById('localizacaoDestino').addEventListener('change', function () {
    const outroInput = document.getElementById('outraLocalizacao');
    outroInput.style.display = this.value === 'OUTRO' ? 'block' : 'none';
    if (this.value !== 'OUTRO') outroInput.value = '';
  });

  const inputBusca = document.getElementById('inputBusca');
  inputBusca.addEventListener(
    'input',
    debounce(function () {
      const termo = this.value.toLowerCase();
      const linhas = document.querySelectorAll('#tabelaProdutos tbody tr');
      linhas.forEach((linha) => {
        const nome = linha.cells[0].textContent.toLowerCase();
        const codigo = linha.cells[1].textContent.toLowerCase();
        linha.style.display = nome.includes(termo) || codigo.includes(termo) ? '' : 'none';
      });
    }, 300)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharModalRastreio();
    }
  });
}

// Inicialização após DOM carregado
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  setupEventListeners();
  initGraficos();
});

// Exportar funções para uso no HTML
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.abrirModalRastreio = abrirModalRastreio;
window.fecharModalRastreio = fecharModalRastreio;
