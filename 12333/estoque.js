
let estoque = {
    produtos: [],
    movimentacoes: []
};


const formProduto = document.getElementById('formProduto');
const formMovimentacao = document.getElementById('formMovimentacao');
const tabelaProdutos = document.querySelector('#tabelaProdutos tbody');
const selectProduto = document.getElementById('selectProduto');
const btnCancelar = document.getElementById('btnCancelar');


let grafico;
let tipoGrafico = 'bar';
let dataFiltroInicio = null;
let dataFiltroFim = null;


document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    initGraficos();
    setupEventListeners();
});


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
                atualizarInterface();
            })
            .catch(() => {
                estoque = { produtos: [], movimentacoes: [] };
                atualizarInterface();
            });
    }
    atualizarInterface();
}

function atualizarInterface() {
    atualizarTabela();
    atualizarSelectProdutos();
    atualizarGrafico();
}

function salvarNoLocalStorage() {
    localStorage.setItem('estoque', JSON.stringify(estoque));
}


function adicionarProduto(produto) {
    produto.id = Date.now().toString();
    produto.quantidade = parseInt(produto.quantidade) || 0;
    produto.preco = parseFloat(produto.preco) || 0;
    
    estoque.produtos.push(produto);
    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarProduto(produtoAtualizado) {
    const index = estoque.produtos.findIndex(p => p.id === produtoAtualizado.id);
    if (index !== -1) {
        produtoAtualizado.quantidade = parseInt(produtoAtualizado.quantidade) || 0;
        produtoAtualizado.preco = parseFloat(produtoAtualizado.preco) || 0;
        
        estoque.produtos[index] = produtoAtualizado;
        salvarNoLocalStorage();
        atualizarInterface();
    }
}

function excluirProduto(id) {
    estoque.produtos = estoque.produtos.filter(p => p.id !== id);
    salvarNoLocalStorage();
    atualizarInterface();
}


function registrarMovimentacao(movimentacao) {
    const produto = estoque.produtos.find(p => p.id === movimentacao.produtoId);
    if (!produto) return;

    movimentacao.quantidade = parseInt(movimentacao.quantidade) || 0;
    
    if (movimentacao.tipo === 'entrada') {
        produto.quantidade += movimentacao.quantidade;
    } else {
        if (movimentacao.quantidade > produto.quantidade) {
            throw new Error('Quantidade em estoque insuficiente');
        }
        produto.quantidade -= movimentacao.quantidade;
    }
    
    movimentacao.id = Date.now().toString();
    movimentacao.data = new Date().toISOString();
    estoque.movimentacoes.push(movimentacao);
    salvarNoLocalStorage();
    atualizarInterface();
}


function atualizarTabela() {
    tabelaProdutos.innerHTML = '';
    
    estoque.produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Nome">${produto.nome}</td>
            <td data-label="Código">${produto.codigo}</td>
            <td data-label="Quantidade">${produto.quantidade}</td>
            <td data-label="Preço">R$ ${produto.preco.toFixed(2)}</td>
            <td data-label="Ações" class="acoes">
                <button onclick="editarProduto('${produto.id}')">✏️ Editar</button>
                <button onclick="excluirProduto('${produto.id}')">🗑️ Excluir</button>
            </td>
        `;
        
        if (produto.quantidade <= 5) {
            tr.classList.add('estoque-baixo');
            tr.querySelector('td:nth-child(3)').innerHTML += ' ⚠️';
        }
        
        tabelaProdutos.appendChild(tr);
    });
}

function atualizarSelectProdutos() {
    selectProduto.innerHTML = '<option value="">Selecione...</option>';
    
    estoque.produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.nome} (${produto.codigo}) - ${produto.quantidade} un`;
        selectProduto.appendChild(option);
    });
}


function initGraficos() {
 
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
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
            alert('A data inicial não pode ser maior que a final!');
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

function atualizarGrafico() {
    const ctx = document.getElementById('graficoMovimentacoes').getContext('2d');
    
   
    let movimentacoes = estoque.movimentacoes;
    if (dataFiltroInicio || dataFiltroFim) {
        movimentacoes = movimentacoes.filter(mov => {
            const dataMov = new Date(mov.data);
            return (
                (!dataFiltroInicio || dataMov >= dataFiltroInicio) &&
                (!dataFiltroFim || dataMov <= dataFiltroFim)
            );
        });
    }
    
 
    let labels = [];
    let datasets = [];
    
    switch (tipoGrafico) {
        case 'bar':
            
            const dadosProdutos = {};
            
            movimentacoes.forEach(mov => {
                const produto = estoque.produtos.find(p => p.id === mov.produtoId) || { nome: 'Desconhecido' };
                
                if (!dadosProdutos[produto.id]) {
                    dadosProdutos[produto.id] = {
                        nome: produto.nome,
                        entradas: 0,
                        saidas: 0
                    };
                }
                
                if (mov.tipo === 'entrada') {
                    dadosProdutos[produto.id].entradas += mov.quantidade;
                } else {
                    dadosProdutos[produto.id].saidas += mov.quantidade;
                }
            });
            
            labels = Object.values(dadosProdutos).map(p => p.nome);
            datasets = [
                {
                    label: 'Entradas',
                    data: Object.values(dadosProdutos).map(p => p.entradas),
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Saídas',
                    data: Object.values(dadosProdutos).map(p => p.saidas),
                    backgroundColor: '#F44336'
                }
            ];
            break;
            
        case 'line':
          
            const dadosDatas = {};
            
            movimentacoes.forEach(mov => {
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
                    data: labels.map(data => dadosDatas[data].entradas),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Saídas',
                    data: labels.map(data => dadosDatas[data].saidas),
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true,
                    tension: 0.3
                }
            ];
            break;
            
    }
    
 
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: getTituloGrafico(),
                font: { size: 16 }
            },
            legend: { position: 'top' }
        }
    };
    
    if (tipoGrafico !== 'pie') {
        options.scales = {
            y: { 
                beginAtZero: true, 
                title: { 
                    display: true, 
                    text: 'Quantidade' 
                } 
            },
            x: { 
                title: { 
                    display: true, 
                    text: tipoGrafico === 'bar' ? 'Produtos' : 'Datas' 
                } 
            }
        };
    }
    
    
    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: tipoGrafico,
        data: { labels, datasets },
        options
    });
}

function getTituloGrafico() {
    let titulo = '';
    switch (tipoGrafico) {
        case 'bar': titulo = 'Entradas vs Saídas por Produto'; break;
        case 'line': titulo = 'Histórico de Movimentações'; break;
        case 'pie': titulo = 'Proporção de Movimentações'; break;
    }
    if (dataFiltroInicio || dataFiltroFim) titulo += ' (Filtrado)';
    return titulo;
}


function exportarDados() {
    const dados = JSON.stringify(estoque, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-estoque-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

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
                    alert('Dados importados com sucesso!');
                }
            } else {
                alert('Arquivo inválido! Deve conter produtos e movimentações.');
            }
        } catch (error) {
            alert('Erro ao ler arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}


function setupEventListeners() {
    
    formProduto.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(formProduto);
        const produtoData = Object.fromEntries(formData.entries());
        
   
        produtoData.nome = produtoData.nome.trim();
        produtoData.codigo = produtoData.codigo.trim();
        
        if (!produtoData.nome || !produtoData.codigo) {
            alert('Preencha nome e código corretamente!');
            return;
        }
        
        try {
            if (formProduto.dataset.editando) {
                produtoData.id = formProduto.dataset.editando;
                atualizarProduto(produtoData);
            } else {
                adicionarProduto(produtoData);
            }
            
            formProduto.reset();
            delete formProduto.dataset.editando;
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    });
    
  
    formMovimentacao.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(formMovimentacao);
        const movimentacao = Object.fromEntries(formData.entries());
        
        if (!movimentacao.produtoId) {
            alert('Selecione um produto!');
            return;
        }
        
        movimentacao.quantidade = parseInt(movimentacao.quantidade);
        if (isNaN(movimentacao.quantidade) || movimentacao.quantidade <= 0) {
            alert('Quantidade inválida!');
            return;
        }
        
        try {
            registrarMovimentacao(movimentacao);
            formMovimentacao.reset();
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    });
    
 
    btnCancelar.addEventListener('click', () => {
        formProduto.reset();
        delete formProduto.dataset.editando;
    });
    
 
    document.getElementById('inputBusca').addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const linhas = tabelaProdutos.querySelectorAll('tr');
        
        linhas.forEach(linha => {
            const textoLinha = linha.textContent.toLowerCase();
            linha.style.display = textoLinha.includes(termo) ? '' : 'none';
        });
    });
}


function editarProduto(id) {
    const produto = estoque.produtos.find(p => p.id === id);
    if (produto) {
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('codigo').value = produto.codigo;
        document.getElementById('quantidade').value = produto.quantidade;
        document.getElementById('preco').value = produto.preco;
        formProduto.dataset.editando = produto.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        estoque.produtos = estoque.produtos.filter(p => p.id !== id);
        salvarNoLocalStorage();
        atualizarInterface();
    }
}

