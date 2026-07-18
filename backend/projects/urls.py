from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectCommentViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet)
router.register(r"comments", ProjectCommentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
