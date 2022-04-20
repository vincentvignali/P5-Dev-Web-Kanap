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
  const indexOfItemToDelete = currentBasket.indexOf(itemToDelete);
  currentBasket.splice(indexOfItemToDelete, 1);
  currentBasket.push(item);
  localStorage.setItem("basket", JSON.stringify(currentBasket));
};

/* --- 2 --- */
const modifyQuantity = async (element) => {
  const inputQuantity = parseInt(element.value);

  if (inputQuantity > 0) {
    /**  Recreate the Item Object with new quantity **/
    const item = {
      id: element.closest("article").dataset.id.toString(),
      quantity: inputQuantity.toString(),
      color: element.closest("article").dataset.color.toString(),
    };

    /**  Update the quantity display **/
    const itemQuantityDisplay = element.closest("div").childNodes[0];
    itemQuantityDisplay.textContent = `Quantité : ${inputQuantity}`;

    /**  Update the price display **/
    let itemPrice = parseInt(await retrieveItemPrice(item));
    const itemPriceDisplay = element.closest("div.cart__item__content")
      .childNodes[0].childNodes[2];
    itemPriceDisplay.textContent = `${itemPrice * inputQuantity} €`;

    /**  Store the Updated item into the local Storage **/
    UpdateLocalStorage(item);

    /**  Update the total price **/
    computeTotalPrice();
  } else {
    window.alert(
      "Please, introduce a correct value or press the 'Supprimer' button to delete the Item"
    );
  }
};

/* --- 3 --- */
const computeTotalPrice = async () => {
  /**  Retrieve DOM elements and set variables **/
  const priceDisplay = document.getElementById("totalPrice");
  const quantityDisplay = document.getElementById("totalQuantity");
  let basketTotalPrice = 0;
  let basketTotalQuantity = 0;
  const currentBasket = JSON.parse(localStorage.basket);

  /**  Create a hidden Basket with prices **/
  const SecretArrayWithPrices = await currentBasket.map(async (item) => {
    const itemPrice = await retrieveItemPrice(item);
    item.totalPrice = itemPrice * parseInt(item.quantity);
    return item;
  });

  /**  Iterate through the hidden Basket to get Total Price **/
  for (let i = 0; i < (await SecretArrayWithPrices.length); i++) {
    const element = await SecretArrayWithPrices[i];
    basketTotalPrice += element.totalPrice;
    basketTotalQuantity += parseInt(element.quantity);
  }

  /**  Insert data into Dom Element **/
  priceDisplay.textContent = basketTotalPrice;
  quantityDisplay.textContent = basketTotalQuantity;

  /**  Return total Price **/
  return basketTotalPrice;
};

/* --- 4 --- */
const DeleteElement = (element) => {
  /**  Retrieve Data and set variables **/
  const currentBasket = JSON.parse(localStorage.basket);
  const itemToDeleteId = element.closest("article").dataset.id;
  const itemToDeleteColor = element.closest("article").dataset.color;

  /**  Spot & delete the item in the basket **/
  const itemToDelete = currentBasket.find(
    (element) =>
      element.id === itemToDeleteId && element.color === itemToDeleteColor
  );
  currentBasket.splice(currentBasket.indexOf(itemToDelete), 1);

  /**  Update the local storage with reduced basket **/
  localStorage.clear();
  localStorage.setItem("basket", JSON.stringify(currentBasket));

  /**  Remove item card element from the DOM **/
  element.closest("article").remove();
  if (localStorage.basket === "[]") {
    emptyBasket();
  }

  /**  compute total price **/
  computeTotalPrice();
};

/* --- 5 --- */
const isFormValid = () => {
  /**  Set a Regex Pattern **/
  const patternEmail = /^\S+@\S+\.\S+$/;
  const patternNames = /^[A-Za-z]+$/;
  /**  Retrieve inputs **/
  const emailInput = document.getElementById("email");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  /**  Compare the input with the pattern **/
  const resultEmail = patternEmail.test(emailInput.value);
  console.log(emailInput.value);
  const resultFirstName = patternNames.test(firstName.value);
  console.log(firstName.value);
  const resultLastName = patternNames.test(lastName.value);
  console.log(lastName.value);
  /**  Return Boolean **/
  const globalCheck = resultEmail && resultFirstName && resultLastName;
  return globalCheck;
};

/* --- 6 --- */
const createOrder = () => {
  /**  Retrieve data form the Dom & Local Storage **/
  const firstNameInput = document.getElementById("firstName").value;
  const lastNameInput = document.getElementById("lastName").value;
  const cityInput = document.getElementById("city").value;
  const addressInput = document.getElementById("address").value;
  const emailInput = document.getElementById("email").value;
  const currentBasket = JSON.parse(localStorage.basket);
  let productIds = [];
  currentBasket.forEach((element) => productIds.push(element.id));

  /**  Create an Order Object **/
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

  /**  Turn it into Json Format **/
  const cleanOrder = JSON.stringify(rawOrder);
  return cleanOrder;
};

/* --- 7 --- */
const orderRequest = async (orderToSend) =>
  /**  Proceed to the API call with the Json element in the request body **/
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
  /**  Create the order **/
  const orderToSend = createOrder();
  /**  Send the order **/
  const orderCompleted = await orderRequest(orderToSend);
  /**  Return the orderID **/
  return orderCompleted.orderId;
};
// ======================= Set Event Listeners ======================= //
/* --- 1 --- */
const setQuantityModifiers = () => {
  /**  Handle the change of item quantity in the basket **/
  const quantityModifiers = document.querySelectorAll(".itemQuantity");
  for (let i = 0; i < quantityModifiers.length; i++) {
    const element = quantityModifiers[i];
    element.addEventListener("change", () => modifyQuantity(element));
  }
};

/* --- 2 --- */
const setDeleteButtons = () => {
  /**  Handle the delete of item quantity in the basket **/
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
  /**  Handle the Order button in the basket **/
  const orderButton = document.getElementById("order");
  orderButton.addEventListener("click", (e) => {
    e.preventDefault();
    /**  Check the requirement(1) **/
    if (existingBasket() === true) {
      /***  Check the requirement(2) ***/
      if (isFormValid() === true) {
        sendOrder()
          .then(
            (orderId) =>
              (location.href = `http://localhost:5500/front/html/confirmation.html?id=${orderId}`)
          )
          // .then(() => localStorage.clear())
          .catch((e) => console.log(e));
      } else {
        alert("Sorry, something is wrong with your form");
      }
    } else {
      alert("Sorry, your basket is empty");
    }
  });
};

// ======================= Page Builder ======================= //
const pageBuilder = async () => {
  /**  Retrieve items in the basket **/
  currentBasket = JSON.parse(localStorage.basket);
  /**  Iterate to create in the Dom one card per item **/
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
    setOrderButton();
  }
};

main();
