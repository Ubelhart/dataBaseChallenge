const socket = io.connect();

function renderProducts(products) {
  const html = products
    .map((product) => {
      return `
        <tr>
          <td> ${product.title} </td>
          <td>${product.price}</td>
          <td><img src=${product.thumbnail} /></td>
        </tr>`;
    })
    .join(" ");
  document.getElementById("table").innerHTML = html;
}

socket.on("products", (products) => {
  renderProducts(products);
});

document.getElementById("products").addEventListener("submit", (e) => {
  e.preventDefault();
});

function addProducts() {
  const newProduct = {
    title: document.getElementById("title").value,
    price: document.getElementById("price").value,
    thumbnail: document.getElementById("thumbnail").value,
  };
  socket.emit("new-products", newProduct);
}

function renderMessage(messages) {
  const html = messages
    .map((elem) => {
      return `<div>
        <strong class="email">${elem.email}</strong>
        <em class="date">[${new Date(Date.now())}]</em>:
        <em class="text">${elem.text}</em> </div>`;
    })
    .join(" ");
  document.getElementById("messages").innerHTML = html;
}

socket.on("messages", (messages) => {
  renderMessage(messages);
});

document.getElementById("chat").addEventListener("submit", (e) => {
  e.preventDefault();
});

function addMessage() {
  const newMessage = {
    email: document.getElementById("email").value,
    text: document.getElementById("text").value,
  };
  socket.emit("new-message", newMessage);
}
