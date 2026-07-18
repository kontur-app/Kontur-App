from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    STATUS_CHOICES = [
        ("idea", "Идея"),
        ("in_progress", "В работе"),
        ("sold", "Продан"),
        ("completed", "Завершён"),
        ("cancelled", "Отменён"),
        ("problematic", "Проблемный"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Низкий"),
        ("medium", "Средний"),
        ("high", "Высокий"),
        ("urgent", "Срочный"),
    ]

    name = models.CharField(max_length=255, verbose_name="Название проекта")
    description = models.TextField(blank=True, verbose_name="Описание")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="idea", verbose_name="Статус"
    )
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="medium", verbose_name="Приоритет"
    )
    client = models.CharField(max_length=255, blank=True, verbose_name="Клиент")
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, verbose_name="Бюджет"
    )
    deadline = models.DateField(null=True, blank=True, verbose_name="Дедлайн")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects",
        verbose_name="Создатель"
    )
    assigned_users = models.ManyToManyField(
        User, blank=True, related_name="assigned_projects",
        verbose_name="Назначенные пользователи"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProjectComment(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="comments"
    )
    text = models.TextField(verbose_name="Текст")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="project_comments",
        verbose_name="Автор"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.project.name}"
