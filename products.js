/* =========================================================
   PRODUCTS PAGE - JSON RENDER + FILTER LOGIC
========================================================= */

let allProducts = [];

const defaultImage = "images/vault-logo.png";

const defaultCategories = [
  "Furniture",
  "Home Decor",
  "Lighting",
  "Wall Art",
  "Records",
  "Comics",
  "Toys",
  "Sports Memorabilia",
  "Books",
  "Jewelry",
  "Clothing",
  "Handbags",
  "Accessories",
  "Holiday-Christmas",
  "Holiday-Halloween",
  "Holiday-4th of July",
  "Seasonal-Spring",
  "Seasonal-Fall",
  "Other",
  "Outdoor"
];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "")
    .trim();
}

async function loadProductsFromJSON() {
  const response = await fetch("data/inventory.json");

  if (!response.ok) {
    throw new Error("Could not load data/inventory.json");
  }

  const exportedProducts = await response.json();
  allProducts = exportedProducts.filter(isFeaturedFind);
}

function isAvailableForWebsite(product) {
  const status = String(product.status || "").toLowerCase();
  const quantityAvailable = Number(product.quantity_available ?? product.quantity ?? 0);

  if (status.includes("removed") || status === "sold") return false;
  return quantityAvailable > 0;
}

function hasProductPhoto(product) {
  const image = String(product.image || "").trim().toLowerCase();
  return image &&
    !image.includes("vault-logo") &&
    !image.includes("placeholder") &&
    !image.includes("placholder");
}

function isFeaturedFind(product) {
  return isAvailableForWebsite(product) && hasProductPhoto(product);
}

function loadCategoryCheckboxes() {
  const categoryContainer = document.getElementById("categoryCheckboxes");
  if (!categoryContainer) return;

  const categoriesFromProducts = [...new Set(
    allProducts.map(p => p.category).filter(Boolean)
  )];

  const categories = categoriesFromProducts.length
    ? categoriesFromProducts
    : defaultCategories;

  categoryContainer.innerHTML = "";

  categories.forEach(category => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" name="category" value="${category}">
      ${category}
    `;
    categoryContainer.appendChild(label);
  });
}

function renderProducts(products) {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<p class="empty-products">No featured finds match these filters.</p>`;
    updateResultsCount(0, allProducts.length);
    return;
  }

  grid.innerHTML = products.map(product => `
    <div 
      class="catalog-card"
      data-category="${escapeHtml(product.category || "")}"
      data-price="${Number(product.price || 0)}"
      data-condition="${escapeHtml(product.condition || "")}"
    >
     <img 
  src="${escapeHtml(product.image || defaultImage)}" 
  alt="${escapeHtml(product.name || "Vault item")}"
  onerror="this.onerror=null; this.src='${defaultImage}';"
/>

      <div class="catalog-card-content">
        <p class="catalog-category">${escapeHtml(product.category || "Uncategorized")}</p>
        <h3>${escapeHtml(product.name || "Unnamed Item")}</h3>
        <p class="catalog-condition">${escapeHtml(product.condition || "Condition not listed")}</p>
        <p class="catalog-price">${money(product.price)}</p>
      </div>
    </div>
  `).join("");

  updateResultsCount(products.length, allProducts.length);
}

function matchesPriceRange(price, selectedRanges) {
  if (selectedRanges.length === 0) return true;

  return selectedRanges.some(range => {
    if (range === "under-25") return price < 25;
    if (range === "25-75") return price >= 25 && price <= 75;
    if (range === "75-150") return price > 75 && price <= 150;
    if (range === "150-300") return price > 150 && price <= 300;
    if (range === "over-300") return price > 300;
    return true;
  });
}

function filterProducts() {
  const selectedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map(input => input.value);

  const selectedPrices = Array.from(
    document.querySelectorAll('input[name="price"]:checked')
  ).map(input => input.value);

  const selectedConditions = Array.from(
    document.querySelectorAll('input[name="condition"]:checked')
  ).map(input => input.value);

  const filtered = allProducts.filter(product => {
    const category = product.category || "";
    const price = Number(product.price || 0);
    const conditionSlug = slugify(product.condition);

    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(category);

    const priceMatch = matchesPriceRange(price, selectedPrices);

    const conditionMatch =
      selectedConditions.length === 0 || selectedConditions.includes(conditionSlug);

    return categoryMatch && priceMatch && conditionMatch;
  });

  renderProducts(filtered);
}

function updateResultsCount(visibleCount, totalCount) {
  const resultsCount = document.getElementById("resultsCount");
  if (!resultsCount) return;

  resultsCount.textContent = `Showing ${visibleCount} of ${totalCount} featured finds`;
}

async function initProductsPage() {
  try {
    await loadProductsFromJSON();
    loadCategoryCheckboxes();
    renderProducts(allProducts);

    const allCheckboxes = document.querySelectorAll(
      '.products-sidebar input[type="checkbox"]'
    );

    allCheckboxes.forEach(checkbox => {
      checkbox.addEventListener("change", filterProducts);
    });

  } catch (error) {
    console.error("Featured finds page error:", error);

    const grid = document.querySelector(".products-grid");
    if (grid) {
      grid.innerHTML = `
        <p class="empty-products">
          Featured finds could not be loaded. Make sure data/inventory.json exists.
        </p>
      `;
    }

    updateResultsCount(0, 0);
  }
}

initProductsPage();
