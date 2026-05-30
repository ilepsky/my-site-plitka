import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from .models import Product, Category, Banner, Order

def index(request):
    categories = Category.objects.all()
    banners = Banner.objects.filter(active=True)
    return render(request, 'shop/index.html', {
        'categories': categories,
        'banners': banners,
    })

def filter_products(request):
    tag = request.GET.get('tag', 'all')
    query = request.GET.get('q', '').strip()

    products = Product.objects.filter(in_stock=True)

    if tag != 'all':
        products = products.filter(tag=tag)

    if query:
        # Поиск по всем текстовым полям и характеристикам
        products = products.filter(
            Q(name__icontains=query) |
            Q(desc__icontains=query) |
            Q(category__name__icontains=query)
        )
        
        # Поиск по характеристикам (specs) через JSON
        extra_product_ids = []
        all_products = Product.objects.filter(in_stock=True)
        if tag != 'all':
            all_products = all_products.filter(tag=tag)
        
        for p in all_products:
            try:
                specs = p.specs
                if isinstance(specs, dict):
                    for key, value in specs.items():
                        if query.lower() in str(value).lower():
                            extra_product_ids.append(p.id)
                            break
                elif isinstance(specs, str):
                    if query.lower() in specs.lower():
                        extra_product_ids.append(p.id)
            except:
                pass
        
        if extra_product_ids:
            products = products | Product.objects.filter(id__in=extra_product_ids)
        
        products = products.distinct()

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

    if query:
        category_name = f"🔍 Результаты поиска: {query} (найдено: {products.count()})"
    elif tag == 'all':
        category_name = "Популярные товары"
    else:
        category_name = products[0].category.name if products.exists() else "Товары отсутствуют"

    return JsonResponse({'products': products_list, 'category_name': category_name})
def product_detail(request, id):
    try:
        product = Product.objects.get(id=id, in_stock=True)
        return JsonResponse({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'category': product.category.name,
            'tag': product.tag,
            'img': product.img,
            'desc': product.desc,
            'specs': product.specs,
        })
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Товар не найден'}, status=404)

@csrf_exempt
def create_order(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    try:
        data = json.loads(request.body)
        items = data.get('items', [])
        for item in items:
            if 'quantity' not in item:
                item['quantity'] = 1
        order = Order.objects.create(
            customer_name=data.get('name', ''),
            customer_phone=data.get('phone', ''),
            customer_email=data.get('email', ''),
            customer_address=data.get('address', ''),
            customer_comment=data.get('comment', ''),
            items=items,
            total_price=data.get('total', 0),
            status='new'
        )
        return JsonResponse({'success': True, 'order_id': order.id, 'message': f'Заказ #{order.id} успешно создан!'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)