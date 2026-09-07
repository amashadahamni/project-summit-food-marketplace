const HOME_PRODUCT_IMAGES = {
  Drinks: "../../assets/home-images/drinks.jpg",
  Fruit: "../../assets/home-images/fruit.jpg",
  Pantry: "../../assets/home-images/pantry.jpg",
  Seafood: "../../assets/home-images/seafood.jpg",
  Vegetables: "../../assets/home-images/vegetables.jpg"
};

function homeProductImagePath(product) {
  return HOME_PRODUCT_IMAGES[product.category] || "../../assets/home-images/pantry.jpg";
}