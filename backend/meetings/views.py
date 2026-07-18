from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from .models import Meeting, MeetingNote
from .serializers import MeetingSerializer, MeetingNoteSerializer


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        priority_filter = self.request.query_params.get("priority")
        search = self.request.query_params.get("search")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if priority_filter:
            qs = qs.filter(priority=priority_filter)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        now = timezone.now()
        meetings = Meeting.objects.filter(scheduled_at__gte=now, status="scheduled")
        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total = Meeting.objects.count()
        upcoming = Meeting.objects.filter(
            scheduled_at__gte=timezone.now(), status="scheduled"
        ).count()
        by_status = dict(
            Meeting.objects.values_list("status")
            .annotate(c=Count("id"))
            .values_list("status", "c")
        )
        return Response({
            "total": total,
            "upcoming": upcoming,
            "by_status": by_status,
        })


class MeetingNoteViewSet(viewsets.ModelViewSet):
    queryset = MeetingNote.objects.all()
    serializer_class = MeetingNoteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        meeting_id = self.request.query_params.get("meeting")
        if meeting_id:
            qs = qs.filter(meeting_id=meeting_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
