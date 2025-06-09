let products = [];

const productsContainer = document.getElementById("productsContainer");
const confirm = document.getElementById("confirm");
const searchInput = document.getElementById("searchInput");

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showConfirmation() {
  confirm.style.display = "block";
  setTimeout(() => {
    confirm.style.display = "none";
  }, 2000);
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showConfirmation();
}

function renderProducts(productsList, filterText = "") {
  productsContainer.innerHTML = "";

  const filtered = productsList.filter(p =>
    p.name.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ""}
      <img src="${product.img}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div>
          ${product.oldPrice ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ""}
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
      </div>
      <button class="add-btn">Comprar</button>
    `;
    card.querySelector(".add-btn").addEventListener("click", () => addToCart(product));
    productsContainer.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  renderProducts(products, e.target.value);
});

async function loadProducts() {
  try {
    const response = await fetch('todososprodutos.json');
    if (!response.ok) {
      throw new Error('Erro ao carregar os produtos');
    }
    products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    productsContainer.innerHTML = "<p>Erro ao carregar os produtos.</p>";
  }
}

loadProducts();
