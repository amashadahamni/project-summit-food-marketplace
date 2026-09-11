const product = {
  id: 101,
  name: "Orchard Apples",
  category: "Fruit",
  producer: "Summit Orchard",
  description: "Crisp apples harvested this morning.",
  price: 4.5,
  stock: 12,
  status: "approved"
};

const supplierProduct = {
  ...product,
  id: 202,
  name: "Supplier Carrots",
  status: "rejected",
  rejection_reason: "Please include the harvest date."
};

describe("Summit marketplace demo journeys", () => {
  it("1. lets a customer discover a product and view its details", () => {
    cy.intercept("GET", "**/api/v1/products*", [product]).as("catalog");
    cy.visit("/customer");
    cy.wait("@catalog");
    cy.contains("Orchard Apples").should("be.visible");
    cy.contains("button", "View product").click();
    cy.contains("Crisp apples harvested this morning.").should("be.visible");
    cy.get('input[type="number"]').first().clear().type("2");
  });

  it("2. sends customer search and category filters through the BFF", () => {
    cy.intercept("GET", "**/api/v1/products*", (request) => {
      if (request.query.search === "apple" && request.query.category === "Fruit") request.alias = "filteredCatalog";
      request.reply([product]);
    });
    cy.visit("/customer");
    cy.get('input[placeholder="Chicken, beef, apples..."]').clear().type("apple");
    cy.get("select").select("Fruit");
    cy.wait("@filteredCatalog");
    cy.contains("Orchard Apples").should("be.visible");
  });

  it("3. lets a customer add, update, and remove an active cart item", () => {
    let cart = { items: [] };
    cy.intercept("GET", "**/api/v1/products*", [product]);
    cy.intercept("PUT", "**/api/v1/cart/items", (request) => {
      expect(request.body).to.deep.include({ product_id: 101 });
      cart = { items: [{ product_id: 101, quantity: request.body.quantity }] };
      request.reply(cart);
    }).as("saveCart");
    cy.intercept("GET", "**/api/v1/cart", (request) => request.reply({ body: cart })).as("loadCart");
    cy.intercept("DELETE", "**/api/v1/cart/items/101", (request) => {
      cart = { items: [] };
      request.reply(204);
    }).as("removeCart");
    cy.visit("/customer");
    cy.contains("button", "View product").click();
    cy.contains("button", "Add to cart").click();
    cy.wait("@saveCart").its("request.body.quantity").should("equal", 1);
    cy.wait("@loadCart");
    cy.contains("Your active cart").should("be.visible");
    cy.get('input[aria-label="Quantity for product 101"]').click().type("{selectall}3").blur();
    cy.wait("@saveCart").its("request.body.quantity").should("equal", 3);
    cy.contains("button", "Remove").click();
    cy.wait("@removeCart");
  });

  it("4. lets a supplier submit a new product for review", () => {
    cy.intercept("GET", "**/api/v1/auth/me", { username: "supplier", roles: ["Supplier"] });
    cy.intercept("POST", "**/api/v1/products", (request) => {
      expect(request.body).to.include({ name: "Fresh Kale", category: "Vegetables", stock: 20 });
      request.reply({ ...request.body, id: 303, status: "pending" });
    }).as("submitProduct");
    cy.intercept("GET", "**/api/v1/products/mine", []);
    cy.visit("/supplier");
    cy.contains("label", "Name").find("input").type("Fresh Kale");
    cy.contains("label", "Category").find("input").type("Vegetables");
    cy.contains("label", "Price").find("input").type("3.25");
    cy.contains("label", "Stock").find("input").type("20");
    cy.contains("label", "Producer").find("input").type("Hill Farm");
    cy.contains("label", "Description").find("textarea").type("Fresh kale from Hill Farm.");
    cy.contains("button", "Submit for review").click();
    cy.wait("@submitProduct");
    cy.contains("Fresh Kale was submitted for review.").should("be.visible");
  });

  it("5. lets a supplier edit and deactivate an owned listing", () => {
    cy.intercept("GET", "**/api/v1/auth/me", { username: "supplier", roles: ["Supplier"] });
    cy.intercept("GET", "**/api/v1/products/mine", [supplierProduct]).as("myProducts");
    cy.intercept("PATCH", "**/api/v1/products/202", (request) => {
      expect(request.body.name).to.equal("Updated Carrots");
      request.reply({ ...supplierProduct, ...request.body, status: "pending" });
    }).as("updateProduct");
    cy.intercept("DELETE", "**/api/v1/products/202", { statusCode: 204 }).as("deactivateProduct");
    cy.visit("/supplier");
    cy.contains("button", "Load my products").click();
    cy.wait("@myProducts");
    cy.contains("Supplier Carrots").parent().contains("button", "Edit").click();
    cy.contains("label", "Name").find("input").clear().type("Updated Carrots");
    cy.contains("button", "Save and resubmit").click();
    cy.wait("@updateProduct");
    cy.contains("Supplier Carrots").parent().contains("button", "Deactivate").click();
    cy.wait("@deactivateProduct");
  });

  it("6. lets a Data Steward approve a submission and view review history", () => {
    const pending = { ...supplierProduct, status: "pending", rejection_reason: null };
    cy.intercept("GET", "**/api/v1/auth/me", { username: "steward", roles: ["DataSteward"] });
    cy.intercept("GET", "**/api/v1/products/review/pending", [pending]).as("pendingQueue");
    cy.intercept("PATCH", "**/api/v1/products/202/approve", { ...pending, status: "approved" }).as("approveProduct");
    cy.intercept("GET", "**/api/v1/products/review/history", [{ ...pending, status: "approved" }]).as("reviewHistory");
    cy.visit("/datasteward");
    cy.contains("button", "Load review queue").click();
    cy.wait("@pendingQueue");
    cy.contains("Supplier Carrots").parent().contains("button", "Approve").click();
    cy.wait("@approveProduct");
    cy.contains("button", "View review history").click();
    cy.wait("@reviewHistory");
    cy.contains("Status: approved").should("be.visible");
  });
});