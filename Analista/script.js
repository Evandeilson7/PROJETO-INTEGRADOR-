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
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
  
    const clientTableBody = document.getElementById("clientTable").getElementsByTagName("tbody")[0];
    clientTableBody.innerHTML = ""; 
    clients.forEach(client => {
      const row = clientTableBody.insertRow();
      row.insertCell(0).textContent = client.nome;
      row.insertCell(1).textContent = client.telefone;
      row.insertCell(2).textContent = client.email;
      row.insertCell(3).textContent = client.endereco;
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
  
    // Exibe o total de receita
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
  function initLoginChart() {
    const ctx = document.getElementById("loginChart").getContext("2d");
    const loginsPorDia = JSON.parse(localStorage.getItem("loginsPorDia")) || [0, 0, 0, 0, 0, 0, 0];
  
    if (window.loginChart) {
      window.loginChart.destroy(); // Remove gráfico anterior, se houver
    }
  
    window.loginChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
        datasets: [{
          label: 'Logins por dia da semana',
          data: loginsPorDia,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1
          }
        }
      }
    });
  }
  
  // Atualiza ao carregar a página do analista
  document.addEventListener("DOMContentLoaded", function () {
    initLoginChart(); 
  });
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