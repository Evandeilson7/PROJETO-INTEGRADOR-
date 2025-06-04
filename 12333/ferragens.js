const productsContainer = document.getElementById("productsContainer");
const confirm = document.getElementById("confirm");

let products = []; 

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
  const exists = cart.find(item => item.id === product.id);
  if (!exists) {
    cart.push({ ...product, quantity: 1 });
  } else {
    exists.quantity++;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  showConfirmation();
}

function renderProducts(filterText = "") {
  productsContainer.innerHTML = "";
  const filtered = products.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));
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

function loadProducts() {
  fetch('ferragens.json')
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar o arquivo ferragens.json");
      }
      return response.json();
    })
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(error => {
      console.error(error);
      productsContainer.innerHTML = "<p>Erro ao carregar os produtos.</p>";
    });
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  renderProducts(e.target.value);
});


loadProducts();
