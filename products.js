/* =========================================================
   PRODUCTS PAGE FILTER LOGIC
   Future-ready for The Vault inventory system
========================================================= */

const defaultCategories = [
  [1, "Furniture"],
  [2, "Home Decor"],
  [3, "Lighting"],
  [4, "Wall Art"],
  [5, "Records"],
  [6, "Comics"],
  [7, "Toys"],
  [8, "Sports Memorabilia"],
  [9, "Books"],
  [10, "Jewelry"],
  [11, "Clothing"],
  [12, "Handbags"],
  [13, "Accessories"],
  [14, "Holiday-Christmas"],
  [15, "Holiday-Halloween"],
  [16, "Holiday-4th of July"],
  [17, "Seasonal-Spring"],
  [18, "Seasonal-Fall"],
  [19, "Other"]
];

async function getCategories() {
  return defaultCategories.map(([id, name]) => ({ id, name }));
}

async function loadCategoryCheckboxes() {
  const categoryContainer = document.getElementById("categoryCheckboxes");
  if (!categoryContainer) return;

  const categories = await getCategories();
  categoryContainer.innerHTML = "";

  categories.forEach((category) => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" name="category" value="${category.name}">
      ${category.name}
    `;

    categoryContainer.appendChild(label);
  });
}

/* =========================================================
   PRICE RANGE LOGIC
========================================================= */

function matchesPriceRange(price, selectedRanges) {
  if (selectedRanges.length === 0) return true;

  return selectedRanges.some((range) => {
    if (range === "under-25") return price < 25;
    if (range === "25-75") return price >= 25 && price <= 75;
    if (range === "75-150") return price > 75 && price <= 150;
    if (range === "150-300") return price > 150 && price <= 300;
    if (range === "over-300") return price > 300;
    return true;
  });
}

/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filterProducts() {
  const cards = document.querySelectorAll(".catalog-card");

  const selectedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map((input) => input.value);

  const selectedPrices = Array.from(
    document.querySelectorAll('input[name="price"]:checked')
  ).map((input) => input.value);

  const selectedConditions = Array.from(
    document.querySelectorAll('input[name="condition"]:checked')
  ).map((input) => input.value);

  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const price = Number(card.dataset.price);
    const condition = card.dataset.condition;

    const conditionSlug = condition
      .toLowerCase()
      .replaceAll(" ", "-")
      .replace("/", "");

    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(category);

    const priceMatch = matchesPriceRange(price, selectedPrices);

    const conditionMatch =
      selectedConditions.length === 0 || selectedConditions.includes(conditionSlug);

    if (categoryMatch && priceMatch && conditionMatch) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  updateResultsCount(visibleCount, cards.length);
}

/* =========================================================
   RESULTS COUNT
========================================================= */

function updateResultsCount(visibleCount, totalCount) {
  const resultsCount = document.getElementById("resultsCount");
  if (!resultsCount) return;

  resultsCount.textContent = `Showing ${visibleCount} of ${totalCount} items`;
}

/* =========================================================
   INIT
========================================================= */

async function initProductsPage() {
  await loadCategoryCheckboxes();

  const allCheckboxes = document.querySelectorAll(
    '.products-sidebar input[type="checkbox"]'
  );

  allCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", filterProducts);
  });

  filterProducts();
}

initProductsPage();