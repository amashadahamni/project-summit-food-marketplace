const API = `${location.protocol}//${location.hostname}:8080/api/v1`;
const status = document.getElementById("accountStatus");
const profileForm = document.getElementById("profileForm");
const reviewForm = document.getElementById("reviewForm");
const displayName = document.getElementById("displayName");

function showSignedInControls(signedIn) {
	document.getElementById("loginLink").hidden = signedIn;
	document.getElementById("signOutBtn").hidden = !signedIn;
}

async function loadReviews() {
	const response = await fetch(`${API}/users/me/reviews`, { credentials: "include" });
	const reviews = await response.json();
	if (!response.ok) throw new Error(reviews.error || "Reviews unavailable.");
	document.getElementById("reviewList").innerHTML = reviews.map((review) => `<article class="item"><strong>${"*".repeat(review.rating)}${".".repeat(5 - review.rating)}</strong><p>${review.comment}</p></article>`).join("");
}

async function loadProfile() {
	const response = await fetch(`${API}/users/me`, { credentials: "include" });
	const profile = await response.json();
	if (!response.ok) throw new Error(response.status === 401 ? "Log in to view your account." : profile.error || "Account unavailable.");
	const customerName = profile.display_name || profile.email || "Customer";
	document.getElementById("welcomeName").textContent = `Hello, ${customerName}`;
	document.getElementById("email").textContent = profile.email || "";
	displayName.value = profile.display_name || "";
	status.textContent = "";
	profileForm.hidden = false;
	document.getElementById("customerReviews").hidden = false;
	showSignedInControls(true);
	await loadReviews();
}

profileForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const response = await fetch(`${API}/users/me`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: displayName.value }) });
	status.textContent = response.ok ? "Profile saved." : "Unable to save profile.";
});

reviewForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const response = await fetch(`${API}/users/me/reviews`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: Number(document.getElementById("rating").value), comment: document.getElementById("comment").value }) });
	const review = await response.json();
	if (!response.ok) { status.textContent = review.error || "Unable to submit your review."; return; }
	reviewForm.reset();
	status.textContent = "Thank you for your review.";
	loadReviews().catch((error) => status.textContent = error.message);
});

loadProfile().catch((error) => { status.textContent = error.message; showSignedInControls(false); });