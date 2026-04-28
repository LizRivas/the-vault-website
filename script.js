/* =========================================================
   THE VAULT WEBSITE
   HORIZONTAL NEW THIS WEEK CAROUSEL

   Future inventory fields:
   - image
   - name
   - category
   - price
   - dateAdded
   - status
========================================================= */


/* =========================================================
   1. MOCK INVENTORY DATA

   Later this array can be replaced with real data from
   The Vault inventory system.
========================================================= */

const inventoryItems = [
  {
    image: "https://picsum.photos/900/650?random=11",
    name: "Vintage Brass Lamp",
    category: "Lighting",
    price: 145.00,
    dateAdded: "2026-04-26",
    status: "active"
  },
  {
    image: "https://picsum.photos/900/650?random=12",
    name: "Antique Wooden Chair",
    category: "Furniture",
    price: 225.00,
    dateAdded: "2026-04-25",
    status: "active"
  },
  {
    image: "https://picsum.photos/900/650?random=13",
    name: "Decorative Ceramic Vase",
    category: "Decor",
    price: 68.00,
    dateAdded: "2026-04-24",
    status: "active"
  },
  {
    image: "https://picsum.photos/900/650?random=14",
    name: "Framed Vintage Mirror",
    category: "Wall Decor",
    price: 185.00,
    dateAdded: "2026-04-22",
    status: "sold"
  },
  {
    image: "https://picsum.photos/900/650?random=15",
    name: "Classic Typewriter",
    category: "Collectibles",
    price: 310.00,
    dateAdded: "2026-04-21",
    status: "active"
  },
  {
    image: "https://picsum.photos/900/650?random=16",
    name: "Mid-Century Side Table",
    category: "Furniture",
    price: 260.00,
    dateAdded: "2026-04-20",
    status: "active"
  }
];


/* =========================================================
   2. CAROUSEL STATE
========================================================= */

let currentSlide = 0;
let itemsPerView = getItemsPerView();
let autoRotateTimer;


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const carouselTrack = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("carouselDots");
const prevButton = document.getElementById("prevItem");
const nextButton = document.getElementById("nextItem");


/* =========================================================
   4. FORMAT HELPERS
========================================================= */

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(price);
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getItemsPerView() {
  if (window.innerWidth <= 820) {
    return 1;
  }

  if (window.innerWidth <= 1050) {
    return 2;
  }

  return 3;
}


/* =========================================================
   5. CREATE PRODUCT CARDS
========================================================= */

function createProductCards() {
  carouselTrack.innerHTML = "";

  inventoryItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const statusClass = item.status.toLowerCase() === "sold" ? "sold" : "";

    card.innerHTML = `
      <div class="product-image">
        <img src="${item.image}" alt="${item.name}">
        <span class="status-pill ${statusClass}">${item.status}</span>
      </div>

      <div class="product-info">
        <p class="product-category">${item.category}</p>
        <h3>${item.name}</h3>
        <p class="product-date">Added ${formatDate(item.dateAdded)}</p>
        <p class="product-price">${formatPrice(item.price)}</p>
      </div>
    `;

    carouselTrack.appendChild(card);
  });
}


/* =========================================================
   6. DOT NAVIGATION
========================================================= */

function getTotalSlides() {
  return Math.max(1, inventoryItems.length - itemsPerView + 1);
}

function createDots() {
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
  const dots = document.querySelectorAll(".carousel-dot");

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}


/* =========================================================
   7. CAROUSEL MOVEMENT
========================================================= */

function updateCarousel() {
  const cards = document.querySelectorAll(".product-card");

  if (!cards.length) {
    return;
  }

  const cardWidth = cards[0].offsetWidth;
  const gap = 24;
  const moveAmount = currentSlide * (cardWidth + gap);

  carouselTrack.style.transform = `translateX(-${moveAmount}px)`;

  updateDots();
}

function goToNextSlide() {
  const totalSlides = getTotalSlides();

  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
  restartAutoRotate();
}

function goToPreviousSlide() {
  const totalSlides = getTotalSlides();

  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
  restartAutoRotate();
}


/* =========================================================
   8. AUTO ROTATE
========================================================= */

function startAutoRotate() {
  autoRotateTimer = setInterval(() => {
    goToNextSlide();
  }, 6000);
}

function restartAutoRotate() {
  clearInterval(autoRotateTimer);
  startAutoRotate();
}


/* =========================================================
   9. RESIZE HANDLING
========================================================= */

function handleResize() {
  const newItemsPerView = getItemsPerView();

  if (newItemsPerView !== itemsPerView) {
    itemsPerView = newItemsPerView;
    currentSlide = 0;
    createDots();
  }

  updateCarousel();
}


/* =========================================================
   10. EVENT LISTENERS
========================================================= */

prevButton.addEventListener("click", goToPreviousSlide);
nextButton.addEventListener("click", goToNextSlide);
window.addEventListener("resize", handleResize);


/* =========================================================
   11. INITIALIZE CAROUSEL
========================================================= */

createProductCards();
createDots();
updateCarousel();
startAutoRotate();
