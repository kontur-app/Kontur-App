from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet, MeetingNoteViewSet

router = DefaultRouter()
router.register(r"meetings", MeetingViewSet)
router.register(r"notes", MeetingNoteViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
