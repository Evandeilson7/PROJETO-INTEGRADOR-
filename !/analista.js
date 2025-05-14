function expandClientInfo() {
  const clientDetails = document.getElementById("clientDetails");
  clientDetails.classList.toggle("hidden");

  loadClientData();
}

function expandPurchaseInfo() {
  const purchaseDetails = document.getElementById("purchaseDetails");
  purchaseDetails.classList.toggle("hidden");

  loadPurchaseData();
}

function loadClientData() {
  const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  const clientTableBody = document.getElementById('clientTableBody');
  clientTableBody.innerHTML = '';

  clientes.forEach(cliente => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.telefone}</td>
      <td>${cliente.email}</td>
      <td>${cliente.endereco}, Nº ${cliente.numeroCasa} - CEP: ${cliente.cep}</td>
    `;
    clientTableBody.appendChild(row);
  });
}

function loadPurchaseData() {
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  let totalRevenue = 0;

  const purchaseTableBody = document.getElementById("purchaseTable").getElementsByTagName("tbody")[0];
  purchaseTableBody.innerHTML = "";

  purchases.forEach(purchase => {
    const row = purchaseTableBody.insertRow();
    row.insertCell(0).textContent = purchase.client;
    row.insertCell(1).textContent = purchase.product;
    row.insertCell(2).textContent = purchase.quantity;
    row.insertCell(3).textContent = `R$ ${purchase.unitPrice.toFixed(2)}`;
    row.insertCell(4).textContent = `R$ ${(purchase.unitPrice * purchase.quantity).toFixed(2)}`;

    totalRevenue += purchase.unitPrice * purchase.quantity;
  });

  document.getElementById("totalRevenue").textContent = totalRevenue.toFixed(2);
}

function saveClientData(clientData) {
  let clients = JSON.parse(localStorage.getItem("clients")) || [];
  clients.push(clientData);
  localStorage.setItem("clients", JSON.stringify(clients));
}

function savePurchaseData(purchaseData) {
  let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  purchases.push(purchaseData);
  localStorage.setItem("purchases", JSON.stringify(purchases));
}


