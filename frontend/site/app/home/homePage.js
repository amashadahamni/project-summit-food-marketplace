const BFF_URL = `${location.protocol}//${location.hostname}:8080/api/v1`;
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");

async function updateAuthActions() {
  const response = await fetch(`${BFF_URL}/users/me`, { credentials: "include" });
  document.getElementById("loginLink").hidden = response.ok;
  document.getElementById("signupLink").hidden = response.ok;
  document.getElementById("signOutBtn").hidden = !response.ok;
}

function renderProducts(products) {
  productStatus.textContent = products.length ? "" : "No approved products are available yet.";
  productList.innerHTML = products.slice(0, 6).map((product) => `
    <a class="product-card" href="../product/product.html?id=${encodeURIComponent(product.id)}">
      <img class="product-card__image" src="${homeProductImagePath(product)}" alt="${product.name}">
      <div><h3>${product.name}</h3><p>${product.producer} · ${product.category}</p></div>
      <p class="price">$${Number(product.price).toFixed(2)}</p>
    </a>`).join("");
}

fetch(`${BFF_URL}/products`)
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then(renderProducts)
  .catch(() => { productStatus.textContent = "Products will appear when the BFF and Product Service are running."; });

updateAuthActions();