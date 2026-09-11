import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { legacy_createStore as createStore } from "redux";

const api = "/api/v1";
const initialState = { products: [], status: "Loading products...", search: "", category: "", selected: null, cart: null };
const store = createStore((state = initialState, action) => action.type === "set" ? { ...state, ...action.payload } : state, initialState);
let root;

function CustomerApp() {
  const dispatch = useDispatch();
  const { products, status, search, category, selected, cart } = useSelector((state) => state);
  const [cartMessage, setCartMessage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const loadProducts = async () => {
    dispatch({ type: "set", payload: { status: "Loading products..." } });
    const parameters = new URLSearchParams();
    if (search) parameters.set("search", search);
    if (category) parameters.set("category", category);
    const response = await fetch(`${api}/products?${parameters}`);
    const data = await response.json().catch(() => ({}));
    dispatch({ type: "set", payload: response.ok ? { products: data, status: data.length ? "" : "No products found." } : { status: data.error || "Products are unavailable." } });
  };

  useEffect(() => { loadProducts().catch(() => dispatch({ type: "set", payload: { status: "Products are unavailable." } })); }, [search, category]);
  const loadCart = async () => {
    const response = await fetch(`${api}/cart`, { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setCartMessage("Sign in as a Customer to manage your cart.");
    dispatch({ type: "set", payload: { cart: data } });
    setCartMessage(data.items.length ? "" : "Your cart is empty.");
  };
  const addToCart = async (product) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return setCartMessage(`Choose a quantity from 1 to ${product.stock}.`);
    const response = await fetch(`${api}/cart/items`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: product.id, quantity }) });
    const data = await response.json().catch(() => ({}));
    setCartMessage(response.ok ? `${product.name} was added to your cart.` : data.error || "Sign in as a Customer to add products to your cart.");
    if (response.ok) loadCart();
  };
  const updateCartItem = async (item, nextQuantity) => {
    const quantityValue = Number(nextQuantity);
    if (!Number.isInteger(quantityValue) || quantityValue < 1) return;
    const response = await fetch(`${api}/cart/items`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: item.product_id, quantity: quantityValue }) });
    if (!response.ok) return setCartMessage((await response.json().catch(() => ({}))).error || "Cart update failed.");
    loadCart();
  };
  const removeCartItem = async (productId) => {
    const response = await fetch(`${api}/cart/items/${productId}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) return setCartMessage("Cart item could not be removed.");
    loadCart();
  };

  return <div className="shell"><Header onCart={loadCart} /><main className="page"><p className="eyebrow">Customer marketplace</p><h1>Fresh food, ready to discover.</h1><p className="lead">Browse approved local products, filter the catalogue, and manage one active cart.</p><div className="panel actions"><label>Search<input value={search} onChange={(event) => dispatch({ type: "set", payload: { search: event.target.value } })} placeholder="Chicken, beef, apples..." /></label><label>Category<select value={category} onChange={(event) => dispatch({ type: "set", payload: { category: event.target.value } })}><option value="">All categories</option>{[...new Set(products.map((product) => product.category))].sort().map((item) => <option key={item}>{item}</option>)}</select></label><button onClick={loadProducts}>Search</button></div>{status && <p className="status">{status}</p>}{cartMessage && <p className="status">{cartMessage}</p>}{selected && <section className="panel"><button onClick={() => dispatch({ type: "set", payload: { selected: null } })}>Back to results</button><h2>{selected.name}</h2><p>{selected.producer} · {selected.category}</p><p>{selected.description}</p><p>{selected.stock} in stock · <span className="price">${Number(selected.price).toFixed(2)}</span></p><label>Quantity<input type="number" min="1" max={selected.stock} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label><button onClick={() => addToCart(selected)}>Add to cart</button></section>}{cart && <section className="panel"><h2>Your active cart</h2>{cart.items.map((item) => <div className="actions" key={item.product_id}><span>Product #{item.product_id}</span><input aria-label={`Quantity for product ${item.product_id}`} type="number" min="1" value={item.quantity} onChange={(event) => updateCartItem(item, event.target.value)} /><button onClick={() => removeCartItem(item.product_id)}>Remove</button></div>)}</section>}<section className="grid">{products.map((product) => <article className="card" key={product.id}><h2>{product.name}</h2><p className="muted">{product.producer} · {product.category}</p><p>{product.stock} in stock</p><p className="price">${Number(product.price).toFixed(2)}</p><button onClick={() => { setQuantity(1); dispatch({ type: "set", payload: { selected: product } }); }}>View product</button></article>)}</section></main></div>;
}
function Header({ onCart }) { const roles = window.summitSession?.roles || []; return <header className="topbar"><a className="brand" href="/">Summit Food Marketplace</a><nav className="nav"><a href="/">Customer</a>{roles.includes("Customer") && <button onClick={onCart}>Cart</button>}{roles.includes("Supplier") && <a href="/supplier">Supplier</a>}{roles.includes("DataSteward") && <a href="/datasteward">Data Steward</a>}{window.summitSession ? <span>Signed in as {window.summitSession.username}</span> : <a href="/frontend/login/login.html">Sign in</a>}</nav></header>; }
export function bootstrap() { return Promise.resolve(); }
export function mount() { const element = document.getElementById("root"); root = createRoot(element); root.render(<Provider store={store}><CustomerApp /></Provider>); return Promise.resolve(); }
export function unmount() { root?.unmount(); return Promise.resolve(); }