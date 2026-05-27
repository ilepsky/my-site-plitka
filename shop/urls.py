from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/filter/', views.filter_products, name='filter_products'),
    path('api/product/<int:id>/', views.product_detail, name='product_detail'),
    path('api/create-order/', views.create_order, name='create_order'),  # ← новая строка
]