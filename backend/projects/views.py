from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Project, ProjectComment
from .serializers import ProjectSerializer, ProjectCommentSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

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
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search) | Q(client__icontains=search)
            )
        return qs

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total = Project.objects.count()
        by_status = dict(Project.objects.values_list("status").annotate(c=Count("id")).values_list("status", "c"))
        by_priority = dict(Project.objects.values_list("priority").annotate(c=Count("id")).values_list("priority", "c"))
        total_budget = float(sum(Project.objects.values_list("budget", flat=True)))
        return Response({
            "total": total,
            "by_status": by_status,
            "by_priority": by_priority,
            "total_budget": total_budget,
        })


class ProjectCommentViewSet(viewsets.ModelViewSet):
    queryset = ProjectComment.objects.all()
    serializer_class = ProjectCommentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
