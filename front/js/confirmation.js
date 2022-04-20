// ======================= Retrieve the Order ID ======================= //
const setConfirmationNumber = () => {
  const paramsId = new URLSearchParams(window.location.search).get("id");
  const orderId = document.getElementById("orderId");
  orderId.textContent = paramsId;
};

// ======================= Main Function ======================= //
const main = () => {
  setConfirmationNumber();
};

main();
