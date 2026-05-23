from django.db import models


class Category(models.Model):
    """Категория товаров"""
    name = models.CharField('Название категории', max_length=100)
    tag = models.CharField('Тег (для фильтрации)', max_length=50, unique=True)
    image = models.URLField('URL изображения', blank=True, default='')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


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