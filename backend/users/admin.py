from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "direction"]
    list_filter = ["direction"]
    search_fields = ["user__username"]
