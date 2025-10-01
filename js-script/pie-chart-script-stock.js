document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://192.168.1.171/api/stock_master_api"; // Remplace par ton IP
  let currentFilter = "all"; // filtre par défaut

  // 🔹 Récupérer les produits via API
  async function fetchProducts() {
    try {
      const res = await fetch(`${API_BASE}/get_products.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Erreur fetchProducts :", err);
      return [];
    }
  }

  let products = await fetchProducts();

  renderPieChart(products);
  renderStockList(products, currentFilter);
  updateTotalProducts(products);

  // ---------------------------
  // PIE CHART
  // ---------------------------
  function renderPieChart(products) {
    const outStock = products.filter(p => p.quantity == 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    const okStock  = products.filter(p => p.quantity >= 10).length;

    const ctx = document.getElementById("stockChart").getContext("2d");
    const stockChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: [
          `Hors stock (${outStock})`,
          `Faible stock (${lowStock})`,
          `Disponible (${okStock})`
        ],
        datasets: [{
          data: [outStock, lowStock, okStock],
          backgroundColor: ["#e74c3c", "#f39c12", "#2ecc71"],
          offset: [0, 0, 0]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        onClick: (evt, activeEls) => {
          if (activeEls.length > 0) {
            const index = activeEls[0].index;
            const clickedLabel = stockChart.data.labels[index].split(" ")[0]; 

            if (currentFilter === clickedLabel) {
              currentFilter = "all";
              stockChart.data.datasets[0].offset = [0, 0, 0];
            } else {
              currentFilter = clickedLabel;
              stockChart.data.datasets[0].offset =
                stockChart.data.labels.map((_, i) => i === index ? 20 : 0);
            }

            stockChart.update();
            renderStockList(products, currentFilter);
          }
        }
      }
    });

    updateLegend(outStock, lowStock, okStock);
  }

  // ---------------------------
  // LISTE PRODUITS
  // ---------------------------
  function renderStockList(products, filter) {
    const listEl = document.getElementById("product-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    const outStock = products.filter(p => p.quantity == 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10);
    const okStock  = products.filter(p => p.quantity >= 10);

    let ordered = [];
    if (filter === "Hors") ordered = outStock;
    else if (filter === "Faible") ordered = lowStock;
    else if (filter === "Disponible") ordered = okStock;
    else ordered = [...outStock, ...lowStock, ...okStock];

    if (ordered.length === 0) {
      listEl.innerHTML = `<p style="color:#666;">Aucun produit trouvé</p>`;
      return;
    }

    ordered.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <input type="checkbox" class="select-product" data-id="${p.id}">
        ${p.photo 
          ? `<img src="${p.photo}" alt="${p.name}">` 
          : `<div class="noimgdiv"></div>`}

        <div class="othercardcontent">
          <div class="product-div">
            <h3>${p.name}</h3>
            <div class="category-box" style="background:${p.categoryColor || '#ccc'}"><p>${p.category || p.category_id}</p></div>
          </div>
          <p>Ref: ${p.ref}</p>
          <div class="product-div">
            <p class="price">${p.price} €</p>
            <p>Quantité: ${p.quantity}</p>
          </div>
          <div class="actions">
            <button class="btn-secondary edit-btn" data-id="${p.id}">Modifier</button>
            <button class="btn-secondary btn-select" data-id="${p.id}">Sélectionner</button>
          </div>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  // ---------------------------
  // TOTAL + LÉGENDE
  // ---------------------------
  function updateTotalProducts(products) {
    const totalEl = document.getElementById("total-products");
    if (totalEl) totalEl.textContent = "Nombre de produits total : " + products.length;
  }

  function updateLegend(outStock, lowStock, okStock) {
    const legendchart = document.querySelector(".legend");
    if (legendchart) {
      legendchart.innerHTML = `
        <span class="legend-item"><span class="color red"></span>${outStock} Hors stock</span>
        <span class="legend-item"><span class="color orange"></span>${lowStock} Faible stock</span>
        <span class="legend-item"><span class="color green"></span>${okStock} Disponible</span>
      `;
    }
  }
});
