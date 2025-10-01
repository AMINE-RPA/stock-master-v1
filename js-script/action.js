/* ========================
   CONFIG API
======================== */
const API_BASE = "http://192.168.1.171/api/stock_master_api"; // IP du Pi

/* ========================
   MODAL AJOUT PRODUIT
======================== */
const openModalBtn = document.getElementById("openModal");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancel");

openModalBtn.onclick = () => {
  productModal.classList.remove("hidden");
  productModal.classList.add("modal");
};

closeModalBtn.onclick = cancelBtn.onclick = () => {
  productModal.classList.add("hidden");
  productModal.classList.remove("modal");
};

/* ========================
   MODAL EDIT PRODUIT
======================== */
const editModal = document.getElementById("edit-modal");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");

function openEditModal() {
  editModal.classList.remove("hidden");
  editModal.classList.add("modal");
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editModal.classList.remove("modal");
}

cancelEditBtn.onclick = closeEditModal;

/* ========================
   UPLOAD PHOTO
======================== */
function readImage(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

document.getElementById("photo").addEventListener("change", (e) => readImage(e.target, "previewImage"));
document.getElementById("edit-photo").addEventListener("change", (e) => readImage(e.target, "edit-previewImage"));

/* ========================
   CRUD API FUNCTIONS
======================== */
async function addProductAPI(product) {
  try {
    const res = await fetch(`${API_BASE}/add_product.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (err) {
    console.error("Erreur addProductAPI :", err);
  }
}

async function updateProductAPI(product) {
  try {
    const res = await fetch(`${API_BASE}/update_product.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (err) {
    console.error("Erreur updateProductAPI :", err);
  }
}

async function deleteProductAPI(id) {
  try {
    const res = await fetch(`${API_BASE}/delete_product.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return await res.json();
  } catch (err) {
    console.error("Erreur deleteProductAPI :", err);
  }
}

/* ========================
   AJOUT PRODUIT
======================== */
const productForm = document.getElementById("productForm");
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
      name: document.getElementById("name").value,
      category_id: document.getElementById("cat").value,
      ref: document.getElementById("ref").value,
      price: parseFloat(document.getElementById("price").value),
      quantity: parseInt(document.getElementById("qty").value),
      photo: document.getElementById("previewImage").src.includes("placeholder") ? null : document.getElementById("previewImage").src,
    };

    await addProductAPI(newProduct);
    await renderProducts(); // utilise render-products.js
    updateTotalProducts();   // mise à jour compteur
    productForm.reset();
    productModal.classList.add("hidden");
    productModal.classList.remove("modal");
  });
}

/* ========================
   EDIT PRODUIT
======================== */
function attachEditButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const product = products.find(p => p.id == id);
      if (!product) return;

      document.getElementById("edit-name").value = product.name;
      document.getElementById("edit-category").value = product.category_id;
      document.getElementById("edit-ref").value = product.ref;
      document.getElementById("edit-price").value = product.price;
      document.getElementById("edit-quantity").value = product.quantity;
      document.getElementById("edit-previewImage").src = product.photo || "https://via.placeholder.com/250x150";

      openEditModal();

      saveEditBtn.onclick = async () => {
        const updatedProduct = {
          id: product.id,
          name: document.getElementById("edit-name").value,
          category_id: document.getElementById("edit-category").value,
          ref: document.getElementById("edit-ref").value,
          price: parseFloat(document.getElementById("edit-price").value),
          quantity: parseInt(document.getElementById("edit-quantity").value),
          photo: document.getElementById("edit-previewImage").src.includes("placeholder") ? null : document.getElementById("edit-previewImage").src
        };

        await updateProductAPI(updatedProduct);
        closeEditModal();
        await renderProducts();
        attachEditButtons(); // ré-attache events après refresh
        updateTotalProducts();
      };
    });
  });
}

/* ========================
   DELETE PRODUIT
======================== */
function attachDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
      await deleteProductAPI(btn.dataset.id);
      await renderProducts();
      attachEditButtons();
      attachDeleteButtons();
      updateTotalProducts();
    });
  });
}

/* ========================
   INIT ACTIONS
======================== */
document.addEventListener("DOMContentLoaded", () => {
  attachEditButtons();
  attachDeleteButtons();
});
