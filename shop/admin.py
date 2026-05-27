from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Category, Product, Banner, Order


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tag']
    search_fields = ['name', 'tag']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'in_stock', 'created_at']
    list_filter = ['category', 'in_stock']
    search_fields = ['name', 'desc']
    list_editable = ['price', 'in_stock']


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'active']
    list_editable = ['order', 'active']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'customer_phone', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name', 'customer_phone', 'customer_email']
    list_editable = ['status']
    readonly_fields = ['created_at', 'items_readonly']

    fieldsets = (
        ('Информация о клиенте', {
            'fields': ('customer_name', 'customer_phone', 'customer_email', 'customer_address', 'customer_comment')
        }),
        ('Информация о заказе', {
            'fields': ('total_price', 'status', 'created_at')
        }),
        ('Состав заказа', {
            'fields': ('items_readonly',),
        }),
    )

    def items_readonly(self, obj):
        if not obj.items:
            return "Нет товаров"

        total = 0
        for item in obj.items:
            total += item.get('price', 0)

        html = '<div style="background:#f8f9fa; padding:12px; border-radius:8px;"><table style="width:100%; border-collapse:collapse;">'
        html += '<tr style="border-bottom:2px solid #ddd;"><th style="text-align:left; padding:8px;">Товар</th><th style="text-align:right; padding:8px;">Цена</th>'

        for item in obj.items:
            name = item.get('name', '?')
            price = item.get('price', 0)
            html += f'<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">{name}</td><td style="text-align:right; padding:8px;">{price} ₽</td></tr>'

        html += f'<tr style="border-top:2px solid #ddd; font-weight:bold;"><td style="padding:8px;">ИТОГО:</td><td style="text-align:right; padding:8px;">{total} ₽</td></tr>'
        html += '</table></div>'

        return mark_safe(html)

    items_readonly.short_description = 'Состав заказа'