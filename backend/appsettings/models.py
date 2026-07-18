from django.db import models


class AppSettings(models.Model):
    app_name = models.CharField(max_length=255, default="Kontur", verbose_name="Название приложения")
    logo = models.ImageField(
        upload_to="logos/", null=True, blank=True, verbose_name="Логотип"
    )
    primary_color = models.CharField(max_length=7, default="#F3EFE6", verbose_name="Основной цвет")
    secondary_color = models.CharField(max_length=7, default="#1B2A6B", verbose_name="Вторичный цвет")
    accent_color = models.CharField(max_length=7, default="#7FE0F5", verbose_name="Дополнительный цвет")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Настройки приложения"
        verbose_name_plural = "Настройки приложения"

    def __str__(self):
        return self.app_name

    def save(self, *args, **kwargs):
        if not self.pk and AppSettings.objects.exists():
            raise ValueError("Можно создать только одну запись настроек")
        super().save(*args, **kwargs)
