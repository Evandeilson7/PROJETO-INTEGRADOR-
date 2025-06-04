const cartContainer = document.getElementById("cart-container");

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

function updateQuantity(id, qty) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    const q = parseInt(qty);
    if (isNaN(q) || q < 1) {
      alert("Quantidade inválida. Mínimo 1.");
      renderCart();
      return;
    }
    item.quantity = q;
    saveCart(cart);
    renderCart();
  }
}

async function loadProducts() {
  try {
    const response = await fetch('carrinho.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Houve um problema com a requisição Fetch:', error);
    return [];
  }
}

async function renderCart() {
  const cart = getCart();
  const products = await loadProducts();
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="empty">Seu carrinho está vazio.</p>';
    return;
  }

  let total = 0;

  let html = `
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Preço</th>
          <th>Quantidade</th>
          <th>Subtotal</th>
          <th>Remover</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      html += `
        <tr>
          <td data-label="Produto">Produto não encontrado (ID: ${item.id})</td>
          <td data-label="Preço">-</td>
          <td data-label="Quantidade">${item.quantity}</td>
          <td data-label="Subtotal">-</td>
          <td data-label="Remover">
            <button onclick="removeItem(${item.id})">X</button>
          </td>
        </tr>
      `;
      return;
    }
    const subtotal = product.price * item.quantity;
    total += subtotal;

    html += `
      <tr>
        <td data-label="Produto">
          <img src="${product.img}" alt="${product.name}" />
          ${product.name}
        </td>
        <td data-label="Preço">R$ ${product.price.toFixed(2)}</td>
        <td data-label="Quantidade">
          <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)" />
        </td>
        <td data-label="Subtotal">R$ ${subtotal.toFixed(2)}</td>
        <td data-label="Remover">
          <button onclick="removeItem(${item.id})">X</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="total">Total: R$ ${total.toFixed(2)}</div>
  `;

  cartContainer.innerHTML = html;
}

renderCart();

document.getElementById('buy-button').addEventListener('click', () => {
  const cart = getCart();
  if(cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  window.location.href = 'login.html';
});
