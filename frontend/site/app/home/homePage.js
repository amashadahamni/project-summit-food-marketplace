const BFF_URL = "http://localhost:8080/api/v1";
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");

function renderProducts(products) {
  productStatus.textContent = products.length ? "" : "No approved products are available yet.";
  productList.innerHTML = products.slice(0, 6).map((product) => `
    <a class="product-card" href="../product/product.html?id=${encodeURIComponent(product.id)}">
      <div><h3>${product.name}</h3><p>${product.producer} · ${product.category}</p></div>
      <p class="price">$${Number(product.price).toFixed(2)}</p>
    </a>`).join("");
}

fetch(`${BFF_URL}/products`)
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then(renderProducts)
  .catch(() => { productStatus.textContent = "Products will appear when the BFF and Product Service are running."; });