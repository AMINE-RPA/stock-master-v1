/* ========================
   CONFIG
======================== */
const API_BASE = "http://192.168.1.171/api/stock_master_api"; // IP de ton Pi

/* ========================
   VARIABLES GLOBALES
======================== */
let categories = []; // tableau de toutes les catégories
let products = [];   // tableau de tous les produits

/* ========================
   FETCH CATEGORIES
======================== */
async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/get_categories.php`);
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
    return categories;
  } catch (err) {
    console.error("Erreur fetchCategories :", err);
    return [];
  }
}

/* ========================
   FETCH PRODUCTS
======================== */
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/get_products.php`);
    const data = await res.json();
    products = Array.isArray(data) ? data : [];
    return products;
  } catch (err) {
    console.error("Erreur fetchProducts :", err);
    return [];
  }
}

/* ========================
   RENDER CATEGORY OPTIONS
======================== */
async function renderCategoryOptions() {
  await fetchCategories();

  const addSelect = document.getElementById("cat");
  const editSelect = document.getElementById("edit-category");
  if (!addSelect || !editSelect) return;

  addSelect.innerHTML = "";
  editSelect.innerHTML = "";

  categories.forEach(cat => {
    const optionAdd = document.createElement("option");
    optionAdd.value = cat.id;
    optionAdd.textContent = cat.name;
    optionAdd.style.background = cat.color || "#ccc";
    addSelect.appendChild(optionAdd);

    const optionEdit = document.createElement("option");
    optionEdit.value = cat.id;
    optionEdit.textContent = cat.name;
    optionEdit.style.background = cat.color || "#ccc";
    editSelect.appendChild(optionEdit);
  });
}

/* ========================
   RENDER PRODUCTS LIST
======================== */
async function renderProducts() {
  await fetchProducts();
  const listEl = document.getElementById("product-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  if (products.length === 0) {
    listEl.innerHTML = `<p style="color:#666;">Aucun produit trouvé</p>`;
    return;
  }

  products.forEach((p) => {
    const category = categories.find(c => c.id == p.category_id);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <input type="checkbox" class="select-product" data-id="${p.id}">
      ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : `<div class="noimgdiv"></div>`}
      <div class="othercardcontent">
        <div class="product-div">
          <h3>${p.name}</h3>
          <div class="category-box" style="background:${category?.color || '#ccc'}">
            <p>${category?.name || '-'}</p>
          </div>
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

/* ========================
   UPDATE TOTAL PRODUCTS
======================== */
function updateTotalProducts() {
  const totalEl = document.getElementById("total-products");
  if (!totalEl) return;
  totalEl.innerHTML = "Nombre de produits <br> total : " + (products.length || 0);
}

/* ========================
   INIT RENDER
======================== */
document.addEventListener("DOMContentLoaded", async () => {
  await renderCategoryOptions(); // récupérer les catégories avant d’afficher les produits
  await renderProducts();
  updateTotalProducts();
});
