/* =========================================================
   THE VAULT EVENTS PAGE LOGIC
   Builds event sections from events-data.js
========================================================= */

function getActiveEvents() {
  return vaultEvents
    .filter((event) => event.active)
    .sort((a, b) => {
      // prioritize real dates over "Coming Soon"
      if (a.date === "Coming Soon") return 1;
      if (b.date === "Coming Soon") return -1;
      return 0;
    });
}
function getFeaturedEvent() {
  const activeEvents = getActiveEvents();

  const manualFeatured = activeEvents.find((e) => e.featured);
  if (manualFeatured) return manualFeatured;

  // fallback = first active event
  return activeEvents[0];
}
function loadFeaturedEvent() {
  const featured = getFeaturedEvent();

  if (!featured) return;

  document.getElementById("featuredEventLabel").textContent = "Featured Event";
  document.getElementById("featuredEventTitle").textContent = featured.title;
  document.getElementById("featuredEventDescription").textContent = featured.description;
  document.getElementById("featuredEventDate").textContent = featured.date;
  document.getElementById("featuredEventLocation").textContent =
    featured.location || "408 Main St, Lemont, IL 60439";
  document.getElementById("featuredEventStatus").textContent =
    featured.status || "Details coming soon";
}

function loadUpcomingEvents() {
  const eventsGrid = document.getElementById("eventsGrid");
  if (!eventsGrid) return;

  eventsGrid.innerHTML = "";

  const upcomingEvents = getActiveEvents().filter((event) => !event.featured);

  upcomingEvents.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-preview-card";

    card.innerHTML = `
      <p class="event-tag">${event.tag}</p>
      <h3>${event.title}</h3>
      <p class="event-date">${event.date}</p>
      <p>${event.description}</p>
    `;

    eventsGrid.appendChild(card);
  });
}

function initEventsPage() {
  loadFeaturedEvent();
  loadUpcomingEvents();
}

initEventsPage();