from django.urls import path, include
from rest_framework import routers
from cobot.views import Hello, PointView, MovementView, SequenceView, PostCommandsView

router = routers.DefaultRouter()
router.register(r"point", PointView)
router.register(r"movement", MovementView)
router.register(r"sequence", SequenceView)


urlpatterns = [
    path("hello/", Hello, name="Hello"),
    path("edit/", include(router.urls)),
    path("command/", PostCommandsView.as_view(), name="post_view"),
]
