from django.contrib import admin
from .models import Project, ProjectComment


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "priority", "client", "budget", "deadline"]
    list_filter = ["status", "priority"]
    search_fields = ["name", "description", "client"]


@admin.register(ProjectComment)
class ProjectCommentAdmin(admin.ModelAdmin):
    list_display = ["project", "author", "created_at"]
    list_filter = ["author"]
