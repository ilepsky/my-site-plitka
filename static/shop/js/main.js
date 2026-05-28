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
        <tr><td><strong>${key}:</strong></td><td>${val}</td></tr>
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
                    <tr>${specsHtml}</table>
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

// ========== КОРЗИНА С КОЛИЧЕСТВОМ (РАБОЧАЯ ВЕРСИЯ) ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Нормализация старых данных (добавляем quantity если нет)
for (let i = 0; i < cart.length; i++) {
    if (!cart[i].quantity) {
        cart[i].quantity = 1;
    }
}
saveCart();

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(name, price) {
    // Ищем товар в корзине
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            cart[i].quantity = (cart[i].quantity || 1) + 1;
            found = true;
            break;
        }
    }

    if (!found) {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCart();
    saveCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
    saveCart();
}

function updateQuantity(index, delta) {
    const item = cart[index];
    if (item) {
        const newQty = (item.quantity || 1) + delta;
        if (newQty <= 0) {
            removeItem(index);
        } else {
            item.quantity = newQty;
            updateCart();
            saveCart();
        }
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const countSpan = document.getElementById('count');
    const totalSpan = document.getElementById('total');

    if (!cartItems) return;

    cartItems.innerHTML = '';
    let totalSum = 0;
    let totalCount = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const qty = item.quantity || 1;
        const subtotal = item.price * qty;
        totalSum += subtotal;
        totalCount += qty;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div style="flex:2">
                    <strong>${escapeHtml(item.name)}</strong><br>
                    ${item.price} ₽ × ${qty} = ${subtotal} ₽
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    <button class="qty-btn" onclick="updateQuantity(${i}, -1)">-</button>
                    <span style="min-width:30px; text-align:center">${qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${i}, 1)">+</button>
                    <button class="remove" onclick="removeItem(${i})">✕</button>
                </div>
            </div>
        `;
    }

    countSpan.innerText = totalCount;
    totalSpan.innerText = totalSum;
    saveCart();
}

// Простая защита от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
// ========== КОНЕЦ КОРЗИНЫ ==========

function hideProductPage() {
    document.getElementById('productPage').classList.remove('open');
    document.body.style.overflow = '';
}

function closeProductPage(e) {
    if (e.target.id === 'productPage') hideProductPage();
}

function toggleCart() {
    const cartDiv = document.getElementById('cart');
    if (cartDiv) cartDiv.classList.toggle('open');
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
function showOrderForm() {
    // Получаем данные из localStorage
    let cartData = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartData.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    // Подсчёт итогов с учётом quantity
    let total = 0;
    let totalItems = 0;
    let itemsList = '';

    for (let i = 0; i < cartData.length; i++) {
        const item = cartData[i];
        const qty = item.quantity || 1;  // берём количество из корзины
        const subtotal = item.price * qty;
        total += subtotal;
        totalItems += qty;
        itemsList += `<li>${item.name} — ${item.price} ₽ × ${qty} = ${subtotal} ₽</li>`;
    }

    // Проверка через alert (временная)
    alert('Товаров в заказе: ' + totalItems + ' шт.\nСумма: ' + total + ' ₽');

    // Создаём модальное окно с формой
    const modalHtml = `
        <div id="orderModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:center;justify-content:center">
            <div style="background:#fff;padding:30px;border-radius:20px;width:90%;max-width:500px;max-height:90vh;overflow:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h2 style="margin:0">Оформление заказа</h2>
                    <span onclick="closeOrderModal()" style="font-size:28px;cursor:pointer">&times;</span>
                </div>

                <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin-bottom:20px">
                    <h3 style="margin:0 0 10px 0">Ваш заказ (${totalItems} шт.):</h3>
                    <ul style="margin:0;padding-left:20px">${itemsList}</ul>
                    <div style="font-weight:bold;margin-top:10px">Итого: ${total} ₽</div>
                </div>

                <form id="orderForm">
                    <div style="margin-bottom:15px">
                        <label>Ваше имя *</label>
                        <input type="text" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label>Телефон *</label>
                        <input type="tel" name="phone" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label>Email</label>
                        <input type="email" name="email" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
                    </div>
                    <div style="margin-bottom:15px">
                        <label>Адрес доставки</label>
                        <textarea name="address" rows="2" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px"></textarea>
                    </div>
                    <div style="margin-bottom:20px">
                        <label>Комментарий</label>
                        <textarea name="comment" rows="2" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px"></textarea>
                    </div>
                    <div style="display:flex;gap:10px">
                        <button type="submit" style="flex:1;padding:12px;background:#e87817;color:#fff;border:none;border-radius:8px;cursor:pointer">Отправить</button>
                        <button type="button" onclick="closeOrderModal()" style="flex:1;padding:12px;background:#666;color:#fff;border:none;border-radius:8px;cursor:pointer">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('orderForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        let finalCart = JSON.parse(localStorage.getItem('cart')) || [];
        let finalTotal = 0;
        for (let i = 0; i < finalCart.length; i++) {
            finalTotal += finalCart[i].price * (finalCart[i].quantity || 1);
        }

        const orderData = {
            name: this.name.value,
            phone: this.phone.value,
            email: this.email.value,
            address: this.address.value,
            comment: this.comment.value,
            items: finalCart,
            total: finalTotal
        };

        try {
            const response = await fetch('/api/create-order/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (result.success) {
                alert('✅ Заказ оформлен!');
                localStorage.removeItem('cart');
                updateCart();
                closeOrderModal();
                const cartDiv = document.getElementById('cart');
                if (cartDiv) cartDiv.classList.remove('open');
            } else {
                alert('❌ Ошибка: ' + result.error);
            }
        } catch (error) {
            alert('❌ Ошибка: ' + error);
        }
    });
}
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.remove();
}
// ========== КОНЕЦ ОФОРМЛЕНИЯ ЗАКАЗА ==========

// Инициализация
loadProducts('all');
updateCart();