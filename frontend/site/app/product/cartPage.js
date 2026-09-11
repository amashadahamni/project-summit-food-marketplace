const API = `${location.protocol}//${location.hostname}:8080/api/v1`;
const list = document.getElementById("cartList");
const status = document.getElementById("cartStatus");

async function fetchProduct(productId) {
	const response = await fetch(`${API}/products/${productId}`);
	if (!response.ok) throw new Error("Product details are unavailable.");
	return response.json();
}

async function updateAuthActions() {
	const response = await fetch(`${API}/users/me`, { credentials: "include" });
	document.getElementById("loginLink").hidden = response.ok;
	document.getElementById("signOutBtn").hidden = !response.ok;
}

function cartItemMarkup(item, product) {
	return `
		<article class="cart-item">
			<div>
				<h2>${product.name}</h2>
				<p class="stock">${product.stock} in stock</p>
			</div>
			<label>Quantity
				<input class="quantity" data-quantity-id="${item.product_id}" type="number" min="1" max="${product.stock}" value="${item.quantity}">
			</label>
			<button class="button update" data-product-id="${item.product_id}" data-product-name="${product.name}" data-stock="${product.stock}" type="button">Update</button>
			<a class="button" href="product.html?id=${item.product_id}">View</a>
			<button class="remove" data-product-id="${item.product_id}" type="button">Remove</button>
		</article>`;
}

function registerCartActions() {
	document.querySelectorAll(".update").forEach((button) => button.addEventListener("click", () => updateItem(button)));
	document.querySelectorAll(".remove").forEach((button) => button.addEventListener("click", () => removeItem(button.dataset.productId)));
}

async function loadCart() {
	const response = await fetch(`${API}/cart`, { credentials: "include" });
	const cart = await response.json();
	if (!response.ok) throw new Error(response.status === 401 ? "Log in to view your cart." : cart.error || "Cart unavailable.");

	status.textContent = cart.items.length ? "" : "Your cart is empty.";
	const products = await Promise.all(cart.items.map((item) => fetchProduct(item.product_id)));
	list.innerHTML = cart.items.map((item, index) => cartItemMarkup(item, products[index])).join("");
	registerCartActions();
}

async function updateItem(button) {
	const productId = button.dataset.productId;
	const productName = button.dataset.productName;
	const availableStock = Number(button.dataset.stock);
	const quantity = Number(document.querySelector(`[data-quantity-id="${productId}"]`).value);
	if (!Number.isInteger(quantity) || quantity < 1) {
		status.textContent = "Quantity must be at least one.";
		return;
	}
	if (quantity > availableStock) {
		status.textContent = `Stock unavailable. Only ${availableStock} units of ${productName} are available.`;
		return;
	}

	const response = await fetch(`${API}/cart/items`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ product_id: Number(productId), quantity })
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		status.textContent = payload.error || "Unable to update that item.";
		return;
	}
	status.textContent = "Cart updated.";
	loadCart().catch((error) => status.textContent = error.message);
}

async function removeItem(productId) {
	const response = await fetch(`${API}/cart/items/${productId}`, { method: "DELETE", credentials: "include" });
	if (!response.ok) {
		status.textContent = "Unable to remove that item.";
		return;
	}
	loadCart().catch((error) => status.textContent = error.message);
}

updateAuthActions();
loadCart().catch((error) => status.textContent = error.message);