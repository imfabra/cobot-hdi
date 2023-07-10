from django.urls import path, include
from rest_framework import routers
from cobot.views import Hello, PointViewSet, MovementViewSet, SequenceViewSet

router = routers.DefaultRouter()
router.register(r"point", PointViewSet)
router.register(r"movement", MovementViewSet)
router.register(r"sequence", SequenceViewSet)


urlpatterns = [
    path("hello/", Hello, name="Hello"),
    path("edit/", include(router.urls)),
]
