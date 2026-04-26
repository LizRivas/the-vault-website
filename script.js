const items = [
  {
    name: "Vintage Lamp",
    price: "$45",
    image: "https://picsum.photos/200"
  },
  {
    name: "Antique Clock",
    price: "$120",
    image: "https://picsum.photos/200"
  }
];

const container = document.getElementById("items-container");

items.forEach(item => {
  const div = document.createElement("div");
  div.classList.add("item");

  div.innerHTML = `
    <img src="${item.image}" />
    <h3>${item.name}</h3>
    <p>${item.price}</p>
  `;

  container.appendChild(div);
});