from django.contrib import admin
from .models import Meeting, MeetingNote


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ["title", "organizer", "priority", "status", "scheduled_at"]
    list_filter = ["status", "priority"]
    search_fields = ["title", "description"]


@admin.register(MeetingNote)
class MeetingNoteAdmin(admin.ModelAdmin):
    list_display = ["meeting", "author", "created_at"]
    list_filter = ["author"]
