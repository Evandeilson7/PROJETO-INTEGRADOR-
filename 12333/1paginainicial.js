function addToCart(nome, imagem) {
  const produto = { nome, imagem };

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  const card = document.getElementById("addedCard");
  card.style.display = "block";
  setTimeout(() => {
    card.style.display = "none";
  }, 2000);
}
