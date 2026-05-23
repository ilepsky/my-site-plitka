from django.contrib import admin
from .models import Category, Product, Banner

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tag']
    search_fields = ['name', 'tag']
    prepopulated_fields = {'tag': ('name',)}  # автоматически заполняет tag из name

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'in_stock', 'created_at']
    list_filter = ['category', 'in_stock', 'created_at']
    search_fields = ['name', 'desc']
    list_editable = ['price', 'in_stock']
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'price', 'category', 'tag', 'desc')
        }),
        ('Изображение и характеристики', {
            'fields': ('img', 'specs')
        }),
        ('Статус', {
            'fields': ('in_stock',)
        }),
    )

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'active']
    list_editable = ['order', 'active']