from django.db import models
from django.contrib.auth.models import User


class Meeting(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Низкий"),
        ("medium", "Средний"),
        ("high", "Высокий"),
        ("urgent", "Срочный"),
    ]

    STATUS_CHOICES = [
        ("scheduled", "Запланировано"),
        ("in_progress", "В процессе"),
        ("completed", "Завершено"),
        ("cancelled", "Отменено"),
    ]

    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    idea = models.TextField(blank=True, verbose_name="Идея")
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="medium", verbose_name="Приоритет"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="scheduled", verbose_name="Статус"
    )
    organizer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="organized_meetings",
        verbose_name="Организатор"
    )
    participants = models.CharField(
        max_length=500, blank=True, verbose_name="Участники"
    )
    scheduled_at = models.DateTimeField(verbose_name="Запланировано на")
    duration_minutes = models.IntegerField(default=60, verbose_name="Длительность (мин)")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="meetings",
        verbose_name="Создатель"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return self.title


class MeetingNote(models.Model):
    meeting = models.ForeignKey(
        Meeting, on_delete=models.CASCADE, related_name="notes"
    )
    text = models.TextField(verbose_name="Текст")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="meeting_notes",
        verbose_name="Автор"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note by {self.author} on {self.meeting.title}"
