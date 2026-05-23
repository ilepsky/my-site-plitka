from django.shortcuts import render
from django.http import JsonResponse
from .models import Product, Category, Banner


def index(request):
    """Главная страница"""
    categories = Category.objects.all()
    banners = Banner.objects.filter(active=True)

    return render(request, 'shop/index.html', {
        'categories': categories,
        'banners': banners,
    })


def filter_products(request):
    """Фильтрация товаров из БАЗЫ ДАННЫХ"""
    tag = request.GET.get('tag', 'all')

    if tag == 'all':
        products = Product.objects.filter(in_stock=True)
        category_name = "Популярные товары"
    else:
        products = Product.objects.filter(tag=tag, in_stock=True)
        # Получаем название категории из первого товара
        if products.exists():
            category_name = products.first().category.name
        else:
            category_name = "Товары отсутствуют"

    # Преобразуем товары в формат для JSON
    products_list = []
    for p in products:
        products_list.append({
            'id': p.id,
            'name': p.name,
            'price': p.price,
            'category': p.category.name,
            'tag': p.tag,
            'img': p.img,
            'desc': p.desc,
            'specs': p.specs,
        })

    return JsonResponse({
        'products': products_list,
        'category_name': category_name
    })


def product_detail(request, id):
    """Детальная информация о товаре из БАЗЫ ДАННЫХ"""
    try:
        product = Product.objects.get(id=id, in_stock=True)
        data = {
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'category': product.category.name,
            'tag': product.tag,
            'img': product.img,
            'desc': product.desc,
            'specs': product.specs,
        }
        return JsonResponse(data)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Товар не найден'}, status=404)