const inputs = [...document.querySelectorAll('.inp input')];

inputs.forEach((element, index) => {
  element.addEventListener('keyup', () => {
    if (element.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });
});

document.getElementById("formVerificacao").addEventListener("submit", function (event) {
  event.preventDefault();
  window.location.href = "estoque.html";
});
