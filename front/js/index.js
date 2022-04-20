// ======================= API Call ======================= //
const retrieveAllProducts = () =>
  fetch("http://localhost:3000/api/products/")
    .then((res) => res.json())
    .catch((err) => console.log("Watch out, there is an error : ", err));

// ======================= Retrieve the HTML section ======================= //
const items = document.getElementById("items");

// ======================= Build a product component ======================= //
const createItem = (product) => {
  /* Create nodes and content */
  const item = document.createElement("a");
  item.setAttribute(
    "href",
    `http://localhost:5500/front/html/product.html?id=${product._id}`
  );
  const itemWrapper = document.createElement("article");
  const itemImage = document.createElement("img");
  itemImage.setAttribute("src", product.imageUrl);
  const itemTitle = document.createElement("h3");
  itemTitle.textContent = product.name;
  const itemDescription = document.createElement("p");
  itemDescription.textContent = product.description;

  /* Assemble the component */
  itemWrapper.appendChild(itemImage);
  itemWrapper.appendChild(itemTitle);
  itemWrapper.appendChild(itemDescription);
  item.appendChild(itemWrapper);

  /* Insert the component */
  items.appendChild(item);
};

// ======= Main function =======//
const main = async () => {
  const allProducts = await retrieveAllProducts();

  for (let i = 0; i < allProducts.length; i++) {
    const element = allProducts[i];
    createItem(element);
  }
};

main();
