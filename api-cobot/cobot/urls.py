from django.urls import path
from cobot.views import Hello

urlpatterns = [
    path("edit/", Hello, name="Hello"),
]
