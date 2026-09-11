const API = `${location.protocol}//${location.hostname}:8080/api/v1`;
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");
const form = document.getElementById("searchForm");
const searchInput = document.getElementById("search");
const categoryInput = document.getElementById("category");
const minimumPriceInput = document.getElementById("minimumPrice");
const maximumPriceInput = document.getElementById("maximumPrice");
const inStockInput = document.getElementById("inStock");

function productCard(product) { return `<a class="product-card" href="product.html?id=${product.id}"><img class="product-card__image" src="${productImagePath(product)}" alt="${product.name}"><div><h2>${product.name}</h2><p>${product.producer} · ${product.category}</p><p>${product.description}</p></div><p class="stock">${product.stock} in stock</p><p class="price">$${Number(product.price).toFixed(2)}</p></a>`; }
function populateCategories(products) {
  const categories = [...new Set(products.map((product) => product.category))].sort();
  categoryInput.innerHTML = `<option value="">All categories</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
}
async function updateAuthActions() {
  const response = await fetch(`${API}/users/me`, { credentials: "include" });
  document.getElementById("loginLink").hidden = response.ok;
  document.getElementById("signOutBtn").hidden = !response.ok;
}
async function loadProducts() {
  productStatus.textContent = "Loading products...";
  const parameters = new URLSearchParams(location.search);
  if (searchInput.value) parameters.set("search", searchInput.value);
  if (categoryInput.value) parameters.set("category", categoryInput.value);
  if (minimumPriceInput.value) parameters.set("minimum_price", minimumPriceInput.value);
  if (maximumPriceInput.value) parameters.set("maximum_price", maximumPriceInput.value);
  if (inStockInput.checked) parameters.set("in_stock", "true");
  const response = await fetch(`${API}/products?${parameters}`);
  const products = await response.json();
  if (!response.ok) throw new Error(products.error || "Products could not be loaded.");
  if (categoryInput.options.length === 1) populateCategories(products);
  productStatus.textContent = products.length ? "" : "No products matched that search.";
  productList.innerHTML = products.map(productCard).join("");
}
searchInput.value = new URLSearchParams(location.search).get("search") || "";
form.addEventListener("submit", (event) => { event.preventDefault(); loadProducts().catch((error) => productStatus.textContent = error.message); });
document.getElementById("clearFilters").addEventListener("click", () => { form.reset(); loadProducts().catch((error) => productStatus.textContent = error.message); });
updateAuthActions();
loadProducts().catch((error) => productStatus.textContent = error.message);