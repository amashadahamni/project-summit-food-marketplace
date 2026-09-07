const PRODUCT_IMAGE_PATHS = {
  Bakery: "../../assets/product-images/bakery.jpg",
  Biscuits: "../../assets/product-images/biscuits.jpg",
  Chocolates: "../../assets/product-images/chocolates.jpg",
  "Coffee and Tea": "../../assets/product-images/coffee-and-tea.jpg",
  Dairy: "../../assets/product-images/dairy.jpg",
  Drinks: "../../assets/product-images/drinks.jpg",
  Fruit: "../../assets/product-images/fruit.jpg",
  Meats: "../../assets/product-images/meats.jpg",
  Pantry: "../../assets/product-images/pantry.jpg",
  Seafood: "../../assets/product-images/seafood.jpg",
  Snacks: "../../assets/product-images/snacks.jpg",
  Vegetables: "../../assets/product-images/vegetables.jpg"
};

function productImagePath(product) {
  return PRODUCT_IMAGE_PATHS[product.category] || "../../assets/product-images/pantry.jpg";
}