// ======================= Page Builder Logic ======================= //
/* 1. Retrieve the section where to insert items */
const items = document.getElementById("cart__items");

/* 2. Existing basket ? */
const existingBasket = () => {
  if (localStorage.basket && localStorage.basket != "[]") {
    return true;
  } else {
    return false;
  }
};

/* (2bis.) Set text for Empty Basket */
const emptyBasket = () => {
  const wizard = document.createElement("p");
  wizard.textContent =
    "Please go on with your purchase, so far your shopping cart is empty :'(";
  items.appendChild(wizard);
};

/* 3. Retrieve data for an item (image, titel & price) */
const retrieveItemImage = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.imageUrl)
    .catch((err) => console.log("Watch out, there is an error :", err));

const retrieveItemTitle = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.name)
    .catch((err) => console.log("Watch out, there is an error :", err));

const retrieveItemPrice = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.price)
    .catch((err) => console.log("Watch out, there is an error :", err));

/* 4. Create and insert a item component into the Dom */
/** [Section-Image] component Builder **/
const buildImageComponent = async (parent, itemToBuild) => {
  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("cart__item__img");

  const image = document.createElement("img");
  const itemImage = await retrieveItemImage(itemToBuild);
  image.setAttribute("src", itemImage);
  image.setAttribute("alt", "photographie d'un canapé");

  imageWrapper.appendChild(image);
  parent.appendChild(imageWrapper);
};

/** [Sub-Section Description] component Builder **/
const buildInfoDescriptionComponenent = async (parent, itemToBuild) => {
  const infoDescription = document.createElement("div");
  infoDescription.classList.add("cart__item__content__description");
  const infoTitle = document.createElement("h2");
  infoTitle.textContent = await retrieveItemTitle(itemToBuild);
  const infoColor = document.createElement("p");
  infoColor.textContent = itemToBuild.color;
  const infoPrice = document.createElement("p");
  infoPrice.textContent = `${
    (await retrieveItemPrice(itemToBuild)) * itemToBuild.quantity
  } €`;

  infoDescription.appendChild(infoTitle);
  infoDescription.appendChild(infoColor);
  infoDescription.appendChild(infoPrice);

  parent.appendChild(infoDescription);
};

/** [Sub-Section Settings] component Builder **/
const buildInfoSettingsComponent = (parent, itemToBuild) => {
  const infoSettings = document.createElement("div");
  infoSettings.classList.add("cart__item__content__settings");

  const settingsQuantity = document.createElement("div");
  settingsQuantity.classList.add("cart__item__content__settings__quantity");

  const settingsQuantityDisplay = document.createElement("p");
  settingsQuantityDisplay.textContent = `Quantité : ${itemToBuild.quantity}`;

  const settingsQuantityDisplayInput = document.createElement("input");
  settingsQuantityDisplayInput.setAttribute("type", "number");
  settingsQuantityDisplayInput.classList.add("itemQuantity");
  settingsQuantityDisplayInput.setAttribute("name", "ItemQuantity");
  settingsQuantityDisplayInput.setAttribute("min", "1");
  settingsQuantityDisplayInput.setAttribute("max", "100");
  settingsQuantityDisplayInput.setAttribute("value", "0");

  settingsQuantity.appendChild(settingsQuantityDisplay);
  settingsQuantity.appendChild(settingsQuantityDisplayInput);

  const settingsDelete = document.createElement("div");
  settingsDelete.classList.add("cart__item__content__settings__delete");

  const settingsDeleteDisplay = document.createElement("p");
  settingsDeleteDisplay.classList.add("deleteItem");
  settingsDeleteDisplay.textContent = "Supprimer";

  settingsDelete.appendChild(settingsDeleteDisplay);

  infoSettings.appendChild(settingsQuantity);
  infoSettings.appendChild(settingsDelete);

  parent.appendChild(infoSettings);
};

/** Assemble the item component **/
const createItem = async (item) => {
  /** 1 - Build the main Wrapper **/
  const wrapper = document.createElement("article");
  wrapper.classList.add("cart__item");
  wrapper.setAttribute("data-id", item.id);
  wrapper.setAttribute("data-color", item.color);

  /** 2 - Build & attach the Image **/
  await buildImageComponent(wrapper, item);

  /** 3 - Build Info Wrapper **/
  const infoWrapper = document.createElement("div");
  infoWrapper.classList.add("cart__item__content");

  /** 4 - Build & Attach sub Info component [description] **/
  await buildInfoDescriptionComponenent(infoWrapper, item);

  /** 5 - Build & Attach sub Info component [settings] **/
  buildInfoSettingsComponent(infoWrapper, item);

  /** 6 - Attach Info Wrapper to main Wrapper and insert the component **/
  wrapper.appendChild(infoWrapper);
  items.appendChild(wrapper);
};

// ======================= Basket Logic Tools ======================= //
/* --- 1 --- */
const UpdateLocalStorage = (item) => {
  const currentBasket = JSON.parse(localStorage.basket);
  const itemToDelete = currentBasket.find(
    (element) => element.id === item.id && element.color === item.color
  );
  currentBasket.splice(currentBasket.indexOf(itemToDelete), 1);
  currentBasket.push(item);
  localStorage.setItem("basket", JSON.stringify(currentBasket));
};

/* --- 2 --- */
const modifyQuantity = async (element) => {
  const inputQuantity = parseInt(element.value);

  if (inputQuantity > 0) {
    // Recreate the Item Object
    const item = {
      id: element.closest("article").dataset.id.toString(),
      quantity: inputQuantity.toString(),
      color: element.closest("article").dataset.color.toString(),
    };

    // Update the quantity
    element.closest(
      "div"
    ).childNodes[0].textContent = `Quantité : ${inputQuantity}`;

    // Update the price
    let itemPrice = parseInt(await retrieveItemPrice(item));
    element.closest(
      "div.cart__item__content"
    ).childNodes[0].childNodes[2].textContent = `${
      itemPrice * inputQuantity
    } €`;

    // Update the local Storage
    UpdateLocalStorage(item);
    computeTotalPrice();
  } else {
    window.alert(
      "Please, introduce a correct value or press the 'Supprimer' button to delete the Item"
    );
  }
};

/* --- 3 --- */
const computeTotalPrice = async () => {
  const priceDisplay = document.getElementById("totalPrice");
  const quantityDisplay = document.getElementById("totalQuantity");
  let basketTotalPrice = 0;
  let basketTotalQuantity = 0;
  const currentBasket = JSON.parse(localStorage.basket);

  const SecretArrayWithPrices = await currentBasket.map(async (item) => {
    const itemPrice = await retrieveItemPrice(item);
    item.totalPrice = itemPrice * parseInt(item.quantity);
    return item;
  });

  for (let i = 0; i < (await SecretArrayWithPrices.length); i++) {
    const element = await SecretArrayWithPrices[i];
    basketTotalPrice += element.totalPrice;
    basketTotalQuantity += parseInt(element.quantity);
  }
  priceDisplay.textContent = basketTotalPrice;
  quantityDisplay.textContent = basketTotalQuantity;
  return basketTotalPrice;
};

/* --- 4 --- */
const DeleteElement = (element) => {
  const currentBasket = JSON.parse(localStorage.basket);
  const itemToDeleteId = element.closest("article").dataset.id;
  const itemToDeleteColor = element.closest("article").dataset.color;
  const itemToDelete = currentBasket.find(
    (element) =>
      element.id === itemToDeleteId && element.color === itemToDeleteColor
  );
  currentBasket.splice(currentBasket.indexOf(itemToDelete), 1);
  localStorage.clear();
  localStorage.setItem("basket", JSON.stringify(currentBasket));
  computeTotalPrice();
  element.closest("article").remove();
  if (localStorage.basket === "[]") {
    emptyBasket();
  }
};

/* --- 5 --- */
const isFormValid = () => {
  const pattern = /^\S+@\S+\.\S+$/;
  const emailInput = document.getElementById("email");
  const result = pattern.test(emailInput.value);
  return result;
};

/* --- 6 --- */
const createOrder = () => {
  const firstNameInput = document.getElementById("firstName").value;
  const lastNameInput = document.getElementById("lastName").value;
  const cityInput = document.getElementById("city").value;
  const addressInput = document.getElementById("address").value;
  const emailInput = document.getElementById("email").value;
  const currentBasket = JSON.parse(localStorage.basket);
  let productIds = [];
  currentBasket.forEach((element) => productIds.push(element.id));
  const rawOrder = {
    contact: {
      firstName: firstNameInput,
      lastName: lastNameInput,
      city: cityInput,
      address: addressInput,
      email: emailInput,
    },
    products: productIds,
  };
  const cleanOrder = JSON.stringify(rawOrder);
  return cleanOrder;
};

/* --- 7 --- */
const orderRequest = async (orderToSend) =>
  fetch("http://localhost:3000/api/products/order", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: orderToSend,
  }).then((res) => res.json());

/* --- 8 --- */
const sendOrder = async () => {
  if (isFormValid() && !emptyBasket()) {
    const orderToSend = createOrder();
    const orderCompleted = await orderRequest(orderToSend);
    return orderCompleted.orderId;
  } else {
    alert("Sorry, you need to fill the contact form first");
    return null;
  }
};

// ======================= Set Event Listeners ======================= //
/* --- 1 --- */
const setQuantityModifiers = () => {
  const quantityModifiers = document.querySelectorAll(".itemQuantity");
  for (let i = 0; i < quantityModifiers.length; i++) {
    const element = quantityModifiers[i];
    element.addEventListener("change", () => modifyQuantity(element));
  }
};

/* --- 2 --- */
const setDeleteButtons = () => {
  const deleteButtons = document.querySelectorAll(
    ".cart__item__content__settings__delete"
  );
  for (let i = 0; i < deleteButtons.length; i++) {
    const element = deleteButtons[i];
    element.addEventListener("click", () => DeleteElement(element));
  }
};

/* --- 3 --- */
const setOrderButton = () => {
  const orderButton = document.getElementById("order");
  orderButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendOrder()
      .then(
        (orderId) =>
          (location.href = `http://localhost:5500/front/html/confirmation.html?id=${orderId}`)
      )
      .then(() => localStorage.clear());
  });
};

// ======================= Page Builder ======================= //
const pageBuilder = async () => {
  currentBasket = JSON.parse(localStorage.basket);
  for (let i = 0; i < currentBasket.length; i++) {
    const element = currentBasket[i];
    await retrieveItemImage(element);
    await createItem(element);
  }
};

// ======================= Main Function ======================= //
const main = async () => {
  if (existingBasket() === true) {
    await pageBuilder();
    setQuantityModifiers();
    setDeleteButtons();
    setOrderButton();
    computeTotalPrice();
  } else {
    emptyBasket();
  }
};

main();
