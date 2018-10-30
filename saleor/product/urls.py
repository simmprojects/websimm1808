from django.conf.urls import url

import django
from django.conf import settings
from . import views

urlpatterns = [
    url(
        r'^(?P<slug>[a-z0-9-_]+?)-(?P<product_id>[0-9]+)/$',
        views.product_details,
        name='details'),
    url(
        r'^category/(?P<slug>[a-z0-9-_]+?)-(?P<category_id>[0-9]+)/$',
        views.category_index,
        name='category'),
    url(
        r'(?P<slug>[a-z0-9-_]+?)-(?P<product_id>[0-9]+)/add/$',
        views.product_add_to_cart,
        name='add-to-cart'),
    url(
        r'(?P<slug>[a-z0-9-_]+?)-(?P<product_id>[0-9]+)/draw_molecule/$',
        views.product_draw_molecule,
        name='draw_molecule'),
    url(
        r'^collection/(?P<slug>[a-z0-9-_/]+?)-(?P<pk>[0-9]+)/$',
        views.collection_index,
        name='collection')]
