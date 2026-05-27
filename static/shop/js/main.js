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
// Функция оформления заказа
function showOrderForm() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    // Создаём модальное окно с формой
    const modalHtml = `
        <div id="orderModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center">
            <div style="background:#fff;padding:30px;border-radius:20px;width:90%;max-width:500px;max-height:90vh;overflow:auto">
                <h2 style="margin-bottom:20px">Оформление заказа</h2>
                <form id="orderForm">
                    <div style="margin-bottom:15px">
                        <label style="display:block;margin-bottom:5px">Ваше имя *</label>
                        <input type="text" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label style="display:block;margin-bottom:5px">Телефон *</label>
                        <input type="tel" name="phone" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label style="display:block;margin-bottom:5px">Email</label>
                        <input type="email" name="email" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label style="display:block;margin-bottom:5px">Адрес доставки</label>
                        <textarea name="address" rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px"></textarea>
                    </div>
                    <div style="margin-bottom:15px">
                        <label style="display:block;margin-bottom:5px">Комментарий к заказу</label>
                        <textarea name="comment" rows="2" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px"></textarea>
                    </div>
                    <div style="display:flex;gap:10px">
                        <button type="submit" style="flex:1;padding:12px;background:#e87817;color:#fff;border:none;border-radius:8px;cursor:pointer">Отправить заказ</button>
                        <button type="button" onclick="closeOrderModal()" style="flex:1;padding:12px;background:#666;color:#fff;border:none;border-radius:8px;cursor:pointer">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('orderForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        const orderData = {
            name: this.name.value,
            phone: this.phone.value,
            email: this.email.value,
            address: this.address.value,
            comment: this.comment.value,
            items: cart,
            total: total
        };

        try {
            const response = await fetch('/api/create-order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                localStorage.removeItem('cart');
                updateCart();
                closeOrderModal();
                toggleCart(); // закрываем корзину
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            alert('Ошибка при отправке заказа: ' + error);
        }
    });
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.remove();
}