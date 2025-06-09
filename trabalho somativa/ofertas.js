let products = [];

const productsContainer = document.getElementById("productsContainer");
const confirmBox = document.getElementById("confirm");
const searchInput = document.getElementById("searchInput");


function loadProducts() {
  fetch("ofertas.json")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar ofertas.json");
      return response.json();
    })
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(error => {
      console.error("Erro ao carregar os produtos:", error);
      productsContainer.innerHTML = "<p>Erro ao carregar os produtos.</p>";
    });
}


function formatPrice(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


function showConfirmation() {
  confirmBox.style.display = "block";
  setTimeout(() => {
    confirmBox.style.display = "none";
  }, 2000);
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exists = cart.find(item => item.id === product.id);

  if (exists) {
    exists.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showConfirmation();
}


function renderProducts(filterText = "") {
  productsContainer.innerHTML = "";

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

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
        ${product.freteGratis ? `<span class="frete-gratis">Frete grátis</span>` : ""}
      </div>
      <button class="add-btn">Comprar</button>
    `;

    card.querySelector(".add-btn").addEventListener("click", () => addToCart(product));
    productsContainer.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  renderProducts(e.target.value);
});


loadProducts();
