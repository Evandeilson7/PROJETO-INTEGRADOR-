const userInfoDiv = document.getElementById('user-info');
const paymentMethod = document.getElementById('payment-method');
const cardData = document.getElementById('card-data');
const pixData = document.getElementById('pix-data');
const pixInfoBox = document.getElementById('pix-info-box');
const form = document.getElementById('payment-form');

const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
if (usuario) {
  userInfoDiv.textContent = `Cliente: ${usuario.nome} | Email: ${usuario.email}`;
} else {
  userInfoDiv.textContent = 'Nenhum usuário logado. Por favor, faça login.';
}

paymentMethod.addEventListener('change', () => {
  const method = paymentMethod.value;
  if (method === 'credit' || method === 'debit') {
    cardData.style.display = 'block';
    pixData.style.display = 'none';
    pixInfoBox.style.display = 'none';
    document.getElementById('card-number').required = true;
    document.getElementById('expiry-date').required = true;
    document.getElementById('cvv').required = true;
  } else if (method === 'pix') {
    cardData.style.display = 'none';
    pixData.style.display = 'block';
    pixInfoBox.style.display = 'block';
    document.getElementById('card-number').required = false;
    document.getElementById('expiry-date').required = false;
    document.getElementById('cvv').required = false;
  } else {
    cardData.style.display = 'none';
    pixData.style.display = 'none';
    pixInfoBox.style.display = 'none';
    document.getElementById('card-number').required = false;
    document.getElementById('expiry-date').required = false;
    document.getElementById('cvv').required = false;
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();

  if (!usuario) {
    alert('Usuário não está logado.');
    return;
  }

  const formaPagamento = paymentMethod.value;

  const dadosCompra = {
    cliente: usuario.nome,
    email: usuario.email,
    pagamento: formaPagamento,
    total: 'Valor não especificado',
    produtos: 'Produtos não especificados'
  };

  localStorage.setItem('dadosCompra', JSON.stringify(dadosCompra));

  alert('Compra finalizada com sucesso! Obrigado pela preferência.');
  window.location.href = '1paginainicial.html';
});
