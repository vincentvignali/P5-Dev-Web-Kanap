// ======================= Page Construction Logic ======================= //

/* Retrieve the product ID */
const url = new URL(document.location);
const productId = url.searchParams.get("id");

/* Retrieve the HTML section where to insert content */
const itemImage = document.querySelector("article > div.item__img");
const itemTitle = document.getElementById("title");
const itemPrice = document.getElementById("price");
const itemDescription = document.getElementById("description");
const itemColors = document.querySelector("select");

/* Retrieve the HTML element with the quantity and the Add button */
const inputQuantity = document.getElementById("quantity");
const addToCartButton = document.getElementById("addToCart");

/* Api Call */
const retrieveProduct = () =>
  fetch(`http://localhost:3000/api/products/${productId}`)
    .then((res) => res.json())
    .catch((err) => console.log("Watch out there is an error : ", err));

/* Build the element */
const createItem = (product) => {
  /**  create elements **/
  const imageElement = document.createElement("img");
  imageElement.setAttribute("src", `${product.imageUrl}`);

  /**  insert content (image, name, price, description & colors options) **/
  itemImage.appendChild(imageElement);
  itemTitle.textContent = product.name;
  itemPrice.textContent = product.price;
  itemDescription.textContent = product.description;
  for (let i = 0; i < product.colors.length; i++) {
    const element = document.createElement("option");
    element.setAttribute("value", product.colors[i]);
    element.textContent = product.colors[i];
    itemColors.appendChild(element);
  }
};

// ======================= Basket Logic Tools =======================//

/* --- 1 --- */
const inputValidation = () => {
  if (parseInt(inputQuantity.value) !== 0 && itemColors.value !== "") {
    return true;
  } else {
    return false;
  }
};

/* --- 2 --- */
const isBasketExisting = () => {
  if (localStorage.length != 0) {
    return true;
  } else {
    return false;
  }
};

/* --- 3 --- */
const isItemExisting = () => {
  const currentBasket = JSON.parse(localStorage.basket);
  if (
    currentBasket.find(
      (element) =>
        element.id === productId && element.color === itemColors.value
    )
  ) {
    return true;
  } else {
    return false;
  }
};

/* --- 4 --- */
const createItemObject = () => {
  const itemObject = {
    id: productId,
    quantity: parseInt(inputQuantity.value),
    color: itemColors.value,
  };
  return itemObject;
};

/* --- 5 --- */
const createBasket = (item) => {
  localStorage.setItem("basket", "[]");
  setItemIntoBasket(item);
};

/* --- 6 --- */
const setItemIntoBasket = (item) => {
  const currentBasket = JSON.parse(localStorage.basket);
  currentBasket.push(item);
  localStorage.setItem("basket", JSON.stringify(currentBasket));
};

/* --- 7 --- */
const updateItemQuantity = () => {
  /**  Retrieve item **/
  const currentBasket = JSON.parse(localStorage.basket);
  const itemToUpdate = currentBasket.find(
    (element) => element.id === productId && element.color === itemColors.value
  );

  /** Compute & Assign new quantity **/
  const oldQuantity = parseInt(itemToUpdate.quantity);
  const increment = parseInt(inputQuantity.value);
  itemToUpdate.quantity = (oldQuantity + increment).toString();

  /** Remove old item, insert new one & set the new local storage **/
  currentBasket.splice(currentBasket.indexOf(itemToUpdate), 1);
  currentBasket.push(itemToUpdate);
  localStorage.setItem("basket", JSON.stringify(currentBasket));
};

// ======= Add to Basket main function =======//

const setBasket = () => {
  if (inputValidation()) {
    const itemObject = createItemObject();
    if (isBasketExisting()) {
      if (isItemExisting()) {
        updateItemQuantity();
      } else {
        setItemIntoBasket(itemObject);
      }
    } else {
      createBasket(itemObject);
    }
    alert("Your item has been added");
  } else {
    alert("Please select a color and a quantity to add your item");
  }
};

// ======= Main function =======//

const main = async () => {
  const product = await retrieveProduct();
  createItem(product);
  addToCartButton.addEventListener("click", setBasket);
};

main();
