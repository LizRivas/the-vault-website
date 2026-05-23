/* =========================================================
   THE VAULT WEBSITE
   HOMEPAGE "NEW THIS WEEK" CAROUSEL
========================================================= */

const INVENTORY_URL = "data/inventory.json";
const FALLBACK_IMAGE = "images/vault-logo.png";
const MAX_NEW_THIS_WEEK_ITEMS = 8;

let inventoryItems = [];
let currentSlide = 0;
let itemsPerView = getItemsPerView();
let autoRotateTimer;

const carouselTrack = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("carouselDots");
const prevButton = document.getElementById("prevItem");
const nextButton = document.getElementById("nextItem");

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(price || 0));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getSkuNumber(sku) {
  const match = String(sku || "").match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function getSortTime(item) {
  const rawDate = item.list_date || item.dateAdded || item.date_added;
  const time = rawDate ? new Date(`${rawDate}T00:00:00`).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function isAvailableForWebsite(item) {
  const status = String(item.status || "").toLowerCase();
  const quantityAvailable = Number(item.quantity_available ?? item.quantity ?? 0);

  if (status.includes("removed") || status === "sold") return false;
  return quantityAvailable > 0;
}

function hasProductPhoto(item) {
  const image = String(item.image || "").trim().toLowerCase();
  return image &&
    !image.includes("vault-logo") &&
    !image.includes("placeholder") &&
    !image.includes("placholder");
}

function normalizeInventoryItem(item) {
  return {
    image: item.image || FALLBACK_IMAGE,
    name: item.name || item.item_name || "Vault item",
    category: item.category || "Uncategorized",
    price: item.price ?? item.listing_price ?? 0,
    listDate: item.list_date || item.dateAdded || item.date_added || "",
    status: item.status || "Available",
    sku: item.sku || ""
  };
}

async function loadInventoryItems() {
  const response = await fetch(`${INVENTORY_URL}?v=${Date.now()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load data/inventory.json");
  }

  const exportedItems = await response.json();

  inventoryItems = exportedItems
    .filter(isAvailableForWebsite)
    .filter(hasProductPhoto)
    .sort((a, b) => {
      const dateDifference = getSortTime(b) - getSortTime(a);
      if (dateDifference !== 0) return dateDifference;
      return getSkuNumber(b.sku) - getSkuNumber(a.sku);
    })
    .slice(0, MAX_NEW_THIS_WEEK_ITEMS)
    .map(normalizeInventoryItem);
}

function getItemsPerView() {
  if (window.innerWidth <= 760) return 1;
  if (window.innerWidth <= 1120) return 2;
  return 3;
}

function createProductCards() {
  if (!carouselTrack) return;

  if (!inventoryItems.length) {
    carouselTrack.innerHTML = `
      <article class="product-card empty-carousel-card">
        <div class="product-info">
          <p class="product-category">Inventory</p>
          <h3>Featured finds will appear here soon.</h3>
          <p class="product-date">Photographed items selected for the website will appear in this section.</p>
        </div>
      </article>
    `;
    return;
  }

  carouselTrack.innerHTML = "";

  inventoryItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const formattedDate = formatDate(item.listDate);
    const dateLine = formattedDate ? `Added ${formattedDate}` : item.sku ? `SKU ${item.sku}` : "Recently added";
    const image = escapeHtml(item.image);
    const name = escapeHtml(item.name);
    const category = escapeHtml(item.category);
    const status = escapeHtml(item.status);

    card.innerHTML = `
      <div class="product-image">
        <img src="${image}" alt="${name}" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
        <span class="status-pill">${status}</span>
      </div>

      <div class="product-info">
        <p class="product-category">${category}</p>
        <h3>${name}</h3>
        <p class="product-date">${escapeHtml(dateLine)}</p>
        <p class="product-price">${formatPrice(item.price)}</p>
      </div>
    `;

    carouselTrack.appendChild(card);
  });
}

function getTotalSlides() {
  return Math.max(1, inventoryItems.length - itemsPerView + 1);
}

function createDots() {
  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";

  for (let i = 0; i < getTotalSlides(); i++) {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Go to carousel position ${i + 1}`);

    dot.addEventListener("click", () => {
      currentSlide = i;
      updateCarousel();
      restartAutoRotate();
    });

    dotsContainer.appendChild(dot);
  }

  updateDots();
}

function updateDots() {
  document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

function updateCarousel() {
  const cards = document.querySelectorAll(".product-card");

  if (!carouselTrack || !cards.length) return;

  const maxSlide = getTotalSlides() - 1;
  currentSlide = Math.min(currentSlide, maxSlide);

  const cardWidth = cards[0].offsetWidth;
  const gap = Number.parseFloat(getComputedStyle(carouselTrack).gap) || 24;
  const moveAmount = currentSlide * (cardWidth + gap);

  carouselTrack.style.transform = `translateX(-${moveAmount}px)`;
  updateDots();
}

function goToNextSlide() {
  currentSlide = (currentSlide + 1) % getTotalSlides();
  updateCarousel();
  restartAutoRotate();
}

function goToPreviousSlide() {
  currentSlide = (currentSlide - 1 + getTotalSlides()) % getTotalSlides();
  updateCarousel();
  restartAutoRotate();
}

function startAutoRotate() {
  if (inventoryItems.length <= itemsPerView) return;

  autoRotateTimer = setInterval(() => {
    goToNextSlide();
  }, 6000);
}

function restartAutoRotate() {
  clearInterval(autoRotateTimer);
  startAutoRotate();
}

function handleResize() {
  const newItemsPerView = getItemsPerView();

  if (newItemsPerView !== itemsPerView) {
    itemsPerView = newItemsPerView;
    currentSlide = 0;
    createDots();
  }

  updateCarousel();
}

async function initHomepageCarousel() {
  if (!carouselTrack || !dotsContainer || !prevButton || !nextButton) return;

  try {
    await loadInventoryItems();
  } catch (error) {
    console.error("New This Week error:", error);
    inventoryItems = [];
  }

  createProductCards();
  createDots();
  updateCarousel();
  startAutoRotate();

  prevButton.addEventListener("click", goToPreviousSlide);
  nextButton.addEventListener("click", goToNextSlide);
  window.addEventListener("resize", handleResize);
}

initHomepageCarousel();
