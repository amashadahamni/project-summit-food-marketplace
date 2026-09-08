const API = `${location.protocol}//${location.hostname}:8080/api/v1`;
const status = document.getElementById("supplierStatus");
const products = document.getElementById("myProducts");
const form = document.getElementById("productForm");
let editingProductId = null;

function setMessage(message) {
	status.textContent = message;
}

function render(items) {
	products.replaceChildren();
	if (!items.length) {
		products.textContent = "No products submitted yet.";
		return;
	}
	items.forEach((item) => {
		const article = document.createElement("article");
		article.className = "item";
		const title = document.createElement("h3");
		title.textContent = item.name;
		const details = document.createElement("p");
		details.textContent = `${item.category} | $${Number(item.price).toFixed(2)} | ${item.stock} in stock`;
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.textContent = item.status;
		article.append(title, details, tag);
		if (item.rejection_reason) {
			const note = document.createElement("p");
			note.textContent = `Review note: ${item.rejection_reason}`;
			article.append(note);
		}
		const edit = document.createElement("button");
		edit.type = "button";
		edit.className = "text-button";
		edit.textContent = "Edit";
		edit.addEventListener("click", () => beginEdit(item));
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "text-button";
		remove.textContent = "Delete";
		remove.addEventListener("click", () => deleteProduct(item));
		article.append(document.createTextNode(" "), edit, document.createTextNode(" "), remove);
		products.append(article);
	});
}

async function loadProducts() {
	const response = await fetch(`${API}/products/mine`, { credentials: "include" });
	const payload = await response.json();
	if (!response.ok) throw new Error(response.status === 401 ? "Log in as a Supplier to use this workspace." : payload.error || "Supplier workspace unavailable.");
	render(payload);
}

function beginEdit(product) {
	editingProductId = product.id;
	["name", "category", "price", "stock", "producer", "description"].forEach((field) => { form.elements[field].value = product[field]; });
	form.querySelector('button[type="submit"]').textContent = "Save and resubmit";
	form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
	form.reset();
	editingProductId = null;
	form.querySelector('button[type="submit"]').textContent = "Submit for review";
}

async function deleteProduct(product) {
	if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
	const response = await fetch(`${API}/products/${product.id}`, { method: "DELETE", credentials: "include" });
	if (!response.ok) {
		const payload = await response.json();
		setMessage(payload.error || "Product could not be deleted.");
		return;
	}
	setMessage("Product deleted.");
	loadProducts().catch((error) => setMessage(error.message));
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = Object.fromEntries(new FormData(form));
	data.price = Number(data.price);
	data.stock = Number(data.stock);
	const response = await fetch(editingProductId ? `${API}/products/${editingProductId}` : `${API}/products`, {
		method: editingProductId ? "PATCH" : "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});
	const payload = await response.json();
	if (!response.ok) {
		setMessage(payload.error || "Product could not be saved.");
		return;
	}
	setMessage(editingProductId ? "Product updated and resubmitted for review." : "Product submitted for review.");
	resetForm();
	loadProducts().catch((error) => setMessage(error.message));
});

loadProducts().catch((error) => setMessage(error.message));