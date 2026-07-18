from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    DIRECTION_CHOICES = [
        ("backend", "Backend"),
        ("frontend", "Frontend"),
        ("smm", "SMM"),
        ("design", "Дизайн"),
        ("mobile", "Mobile"),
        ("devops", "DevOps"),
        ("qa", "QA"),
        ("pm", "PM"),
        ("other", "Другое"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    direction = models.CharField(
        max_length=20, choices=DIRECTION_CHOICES, default="other", verbose_name="Направление"
    )

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"

    def __str__(self):
        return f"{self.user.username} ({self.get_direction_display()})"
