import debug_toolbar
from .settings import DEBUG
from django.urls import path, include
from .views import IndexView, LoadDrawingsView


urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('draw/', include('draw.urls')),
    path('load-drawings/', LoadDrawingsView.as_view(), name='load-drawings'),
]

if DEBUG:
    urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]