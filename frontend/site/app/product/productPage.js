const API = "http://localhost:8080/api/v1";
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");
const form = document.getElementById("searchForm");
const searchInput = document.getElementById("search");

function productCard(product) { return `<a class="product-card" href="product.html?id=${product.id}"><div><h2>${product.name}</h2><p>${product.producer} · ${product.category}</p><p>${product.description}</p></div><p class="price">$${Number(product.price).toFixed(2)}</p></a>`; }
async function loadProducts() {
  productStatus.textContent = "Loading products...";
  const parameters = new URLSearchParams(location.search);
  if (searchInput.value) parameters.set("search", searchInput.value);
  const response = await fetch(`${API}/products?${parameters}`);
  const products = await response.json();
  if (!response.ok) throw new Error(products.error || "Products could not be loaded.");
  productStatus.textContent = products.length ? "" : "No products matched that search.";
  productList.innerHTML = products.map(productCard).join("");
}
searchInput.value = new URLSearchParams(location.search).get("search") || "";
form.addEventListener("submit", (event) => { event.preventDefault(); loadProducts().catch((error) => productStatus.textContent = error.message); });
loadProducts().catch((error) => productStatus.textContent = error.message);