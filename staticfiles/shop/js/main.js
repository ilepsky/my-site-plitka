// Данные из Django передаются через API
let productsData = [];

// Загрузка товаров с сервера
async function loadProducts(tag = 'all') {
    const response = await fetch(`/api/filter/?tag=${tag}`);
    const data = await response.json();
    productsData = data.products;

    const resetBtn = document.getElementById('resetBtn');
    const catalogTitle = document.getElementById('catalogTitle');

    if (tag !== 'all') {
        resetBtn.style.display = 'block';
        catalogTitle.innerText = data.category_name;
    } else {
        resetBtn.style.display = 'none';
        catalogTitle.innerText = "Популярные товары";
    }

    renderProductsList(productsData);
}

function renderProductsList(products) {
    const container = document.getElementById('productContainer');

    if(products.length === 0) {
        container.innerHTML = `<div class="no-products">В данной категории товаров пока нет</div>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product">
            <div class="product-img-wrapper" onclick="showProductPage(${p.id})">
                <img src="${p.img}" alt="${p.name}">
            </div>
            <div class="product-content">
                <div style="font-size:12px; color:#777; margin-bottom:5px;">${p.category}</div>
                <h3 onclick="showProductPage(${p.id})">${p.name}</h3>
                <div class="price">${p.price} ₽</div>
                <button class="buy" onclick="event.stopPropagation(); addToCart('${p.name}', ${p.price})">В КОРЗИНУ</button>
            </div>
        </div>
    `).join('');
}

async function showProductPage(id) {
    const response = await fetch(`/api/product/${id}/`);
    const product = await response.json();

    const specsHtml = Object.entries(product.specs || {}).map(([key, val]) => `
        <tr><td><strong>${key}:</strong></td><td>${val}<tr></tr>
    `).join('');

    const pageContent = document.getElementById('productPageContent');
    pageContent.innerHTML = `
        <div class="p-image">
            <img src="${product.img}" alt="${product.name}">
        </div>
        <div class="p-info">
            <div>
                <div class="p-category">${product.category}</div>
                <h2 class="p-title">${product.name}</h2>
                <p class="p-desc">${product.desc}</p>
                <div class="p-specs">
                    <table>${specsHtml}</table>
                </div>
            </div>
            <div class="p-footer">
                <div class="price" style="margin-bottom:0">${product.price} ₽</div>
                <button class="buy" style="width:auto; padding: 16px 35px;" onclick="addToCart('${product.name}', ${product.price}); hideProductPage();">В КОРЗИНУ</button>
            </div>
        </div>
    `;

    document.getElementById('productPage').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function filterCategory(tag) {
    loadProducts(tag);
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(name, price) { cart.push({name, price}); updateCart(); }
function removeItem(index) { cart.splice(index, 1); updateCart(); }

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const count = document.getElementById('count');
    const total = document.getElementById('total');
    cartItems.innerHTML = '';
    let sum = 0;
    cart.forEach((item, index) => {
        sum += item.price;
        cartItems.innerHTML += `
            <div class="cart-item">
                <div><strong>${item.name}</strong><br>${item.price} ₽</div>
                <button class="remove" onclick="removeItem(${index})">✕</button>
            </div>
        `;
    });
    count.innerText = cart.length;
    total.innerText = sum;
    saveCart();
}

function hideProductPage() {
    document.getElementById('productPage').classList.remove('open');
    document.body.style.overflow = '';
}

function closeProductPage(e) {
    if (e.target.id === 'productPage') hideProductPage();
}

function toggleCart() { document.getElementById('cart').classList.toggle('open'); }

// Инициализация
loadProducts('all');
updateCart();