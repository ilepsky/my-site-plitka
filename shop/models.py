from django.db import models


class Category(models.Model):
    name = models.CharField('Название', max_length=100)
    tag = models.CharField('Тег', max_length=50, unique=True)
    image = models.ImageField('Изображение', upload_to='categories/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'


class Product(models.Model):
    """Товар"""
    name = models.CharField('Название товара', max_length=200)
    price = models.IntegerField('Цена (в рублях)')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория', related_name='products')
    tag = models.CharField('Тег (для фильтрации)', max_length=50)
    img = models.URLField('URL изображения')
    desc = models.TextField('Описание товара')
    specs = models.JSONField('Характеристики', default=dict,
                             help_text='Формат: {"Размер": "30х60 см", "Материал": "Керамика"}')
    in_stock = models.BooleanField('В наличии', default=True)
    created_at = models.DateTimeField('Дата добавления', auto_now_add=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.price} ₽"


class Banner(models.Model):
    """Баннер на главной странице"""
    title = models.CharField('Заголовок', max_length=100)
    subtitle = models.CharField('Подзаголовок', max_length=100)
    img = models.URLField('URL изображения')
    order = models.IntegerField('Порядок отображения', default=0)
    active = models.BooleanField('Активен', default=True)

    class Meta:
        verbose_name = 'Баннер'
        verbose_name_plural = 'Баннеры'
        ordering = ['order']

    def __str__(self):
        return self.title


class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('processing', 'В обработке'),
        ('completed', 'Выполнен'),
        ('cancelled', 'Отменён'),
    ]

    # Данные клиента
    customer_name = models.CharField('Имя клиента', max_length=200)
    customer_phone = models.CharField('Телефон', max_length=20)
    customer_email = models.EmailField('Email', blank=True)
    customer_address = models.TextField('Адрес доставки', blank=True)
    customer_comment = models.TextField('Комментарий к заказу', blank=True)

    # Данные заказа
    items = models.JSONField('Товары в заказе', default=dict)  # храним список товаров
    total_price = models.IntegerField('Общая сумма заказа')

    # Статус и дата
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ #{self.id} - {self.customer_name} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"