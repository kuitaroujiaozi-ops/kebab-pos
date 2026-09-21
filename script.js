let total = 0;
let orders = [];
let selectedKebab = null;
let checkoutHistory = [];

function addOrder(name, price) {
  const existingOrder = orders.find(function(order) {
    return order.name === name;
  });

  if (existingOrder) {
    existingOrder.quantity++;
  } else {
    orders.push({ name: name, price: price, quantity: 1 });
  }

  calculateTotal();
  displayOrders();
}

function selectKebab(name, price) {
  backToMenu();
  selectedKebab = { name: name, price: price };
  document.getElementById("selected-kebab-name").textContent =
    name + " ¥" + price.toLocaleString();
  document.getElementById("kebab-options").style.display = "block";
}

function addKebab() {
  const sauce = document.querySelector('input[name="sauce"]:checked').value;
  const size = document.querySelector('input[name="size"]:checked').value;
  let finalPrice = selectedKebab.price;

  if (size === "大盛り") finalPrice += 200;

  addOrder(
    selectedKebab.name + "（" + sauce + "・" + size + "）",
    finalPrice
  );

  document.getElementById("kebab-options").style.display = "none";
}

function selectPotato() {
  backToMenu();
  document.getElementById("potato-options").style.display = "block";
}

function addPotato() {
  const selectedFlavor =
    document.querySelector('input[name="potato-flavor"]:checked');
  const flavor = selectedFlavor.value;
  const finalPrice = 800 + Number(selectedFlavor.dataset.extra);

  addOrder("ポテト（" + flavor + "）", finalPrice);
  document.getElementById("potato-options").style.display = "none";
}

function selectHotdog() {
  backToMenu();
  document.getElementById("hotdog-options").style.display = "block";
}

function addHotdog() {
  const ketchup = document.getElementById("hotdog-ketchup").checked;
  const mustard = document.getElementById("hotdog-mustard").checked;
  let topping = "なし";

  if (ketchup && mustard) topping = "ケチャップ・マスタード";
  else if (ketchup) topping = "ケチャップ";
  else if (mustard) topping = "マスタード";

  addOrder("チーズハッドグ（" + topping + "）", 600);
  document.getElementById("hotdog-options").style.display = "none";
  document.getElementById("hotdog-ketchup").checked = false;
  document.getElementById("hotdog-mustard").checked = false;
}

function increaseQuantity(index) {
  orders[index].quantity++;
  calculateTotal();
  displayOrders();
}

function decreaseQuantity(index) {
  orders[index].quantity--;
  if (orders[index].quantity <= 0) orders.splice(index, 1);
  calculateTotal();
  displayOrders();
}

function deleteItem(index) {
  orders.splice(index, 1);
  calculateTotal();
  displayOrders();
}

function calculateTotal() {
  total = 0;
  orders.forEach(function(order) {
    total += order.price * order.quantity;
  });
}

function displayOrders() {
  const orderList = document.getElementById("order-list");
  const totalDisplay = document.getElementById("total");
  orderList.innerHTML = "";

  if (orders.length === 0) {
    orderList.innerHTML =
      '<p class="empty-message">まだ商品が選択されていません</p>';
  }

  orders.forEach(function(order, index) {
    const subtotal = order.price * order.quantity;
    const optionStart = order.name.indexOf("（");
    let productName = order.name;
    let optionText = "";

    if (optionStart !== -1) {
      productName = order.name.substring(0, optionStart);
      optionText = order.name.substring(optionStart + 1).replace("）", "");
    }

    orderList.innerHTML +=
      '<div class="order-item">' +
        '<div class="order-item-name">' + productName + '</div>' +
        '<div class="order-option">' + optionText + '</div>' +
        '<div class="order-item-middle">' +
          '<span class="order-price">¥' + order.price.toLocaleString() + '</span>' +
          '<div class="quantity-control">' +
            '<button onclick="decreaseQuantity(' + index + ')">−</button>' +
            '<span class="quantity">' + order.quantity + '</span>' +
            '<button onclick="increaseQuantity(' + index + ')">＋</button>' +
          '</div>' +
        '</div>' +
        '<div class="order-item-bottom">' +
          '<span class="subtotal">小計 ¥' + subtotal.toLocaleString() + '</span>' +
          '<button class="delete-button" onclick="deleteItem(' + index + ')">削除</button>' +
        '</div>' +
      '</div>';
  });

  totalDisplay.textContent = "合計：¥" + total.toLocaleString();
}

function openCheckout() {
  if (orders.length === 0) {
    alert("商品が選択されていません");
    return;
  }

  document.getElementById("checkout-total").textContent =
    "¥" + total.toLocaleString();
  document.getElementById("payment-input").value = "";
  document.getElementById("change-display").textContent = "¥0";
  document.getElementById("payment-message").textContent = "";
  document.getElementById("checkout-modal").style.display = "flex";
  document.getElementById("payment-input").focus();
}

function closeCheckout() {
  document.getElementById("checkout-modal").style.display = "none";
}

function calculateChange() {
  const paymentInput = document.getElementById("payment-input");
  const changeDisplay = document.getElementById("change-display");
  const message = document.getElementById("payment-message");

  if (paymentInput.value === "") {
    changeDisplay.textContent = "¥0";
    message.textContent = "";
    return;
  }

  const payment = Number(paymentInput.value);

  if (payment <= 0) {
    changeDisplay.textContent = "¥0";
    message.textContent = "正しい金額を入力してください";
    return;
  }

  if (payment < total) {
    changeDisplay.textContent = "¥0";
    message.textContent =
      "あと ¥" + (total - payment).toLocaleString() + " 足りません";
    return;
  }

  changeDisplay.textContent =
    "¥" + (payment - total).toLocaleString();
  message.textContent = "";
}

function completeCheckout() {
  const paymentInput = document.getElementById("payment-input");
  const message = document.getElementById("payment-message");

  if (paymentInput.value === "") {
    message.textContent = "お預かり金額を入力してください";
    return;
  }

  const payment = Number(paymentInput.value);

  if (payment <= 0) {
    message.textContent = "正しい金額を入力してください";
    return;
  }

  if (payment < total) {
    message.textContent =
      "あと ¥" + (total - payment).toLocaleString() + " 足りません";
    return;
  }

  const change = payment - total;
  const now = new Date();
  const time =
    now.getHours().toString().padStart(2, "0") + ":" +
    now.getMinutes().toString().padStart(2, "0");

  checkoutHistory.push({
    total: total,
    payment: payment,
    change: change,
    time: time
  });

  displayHistory();

  alert(
    "会計が完了しました！\n" +
    "お釣り：¥" + change.toLocaleString()
  );

  orders = [];
  total = 0;
  displayOrders();
  closeCheckout();
}

function displayHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  if (checkoutHistory.length === 0) {
    historyList.innerHTML =
      '<p class="empty-history">まだ会計履歴はありません</p>';
    return;
  }

  const reversedHistory = checkoutHistory.slice().reverse();

  reversedHistory.forEach(function(history, index) {
    const historyNumber = checkoutHistory.length - index;

    historyList.innerHTML +=
      '<div class="history-item">' +
        '<div class="history-info">' +
          '<div class="history-number">#' + historyNumber + '</div>' +
          '<div class="history-time">' + history.time + '</div>' +
        '</div>' +
        '<div><span class="history-label">合計</span><br>' +
          '<span class="history-total">¥' + history.total.toLocaleString() + '</span></div>' +
        '<div class="history-payment"><span class="history-label">預かり</span><br>¥' +
          history.payment.toLocaleString() + '</div>' +
        '<div class="history-change"><span class="history-label">お釣り</span><br>¥' +
          history.change.toLocaleString() + '</div>' +
      '</div>';
  });
}

function clearHistory() {
  if (checkoutHistory.length === 0) return;

  if (confirm("会計履歴をすべて削除しますか？")) {
    checkoutHistory = [];
    displayHistory();
  }
}

function backToMenu() {
  document.getElementById("kebab-options").style.display = "none";
  document.getElementById("potato-options").style.display = "none";
  document.getElementById("hotdog-options").style.display = "none";
}

displayOrders();
displayHistory();

