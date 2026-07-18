from rest_framework import serializers
from .models import Project, ProjectComment
from django.contrib.auth.models import User


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class ProjectCommentSerializer(serializers.ModelSerializer):
    author_detail = UserBriefSerializer(source="author", read_only=True)

    class Meta:
        model = ProjectComment
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    comments = ProjectCommentSerializer(many=True, read_only=True)
    created_by_detail = UserBriefSerializer(source="created_by", read_only=True)
    assigned_users_detail = UserBriefSerializer(source="assigned_users", read_only=True, many=True)

    class Meta:
        model = Project
        fields = "__all__"

    def create(self, validated_data):
        assigned_users = validated_data.pop("assigned_users", [])
        validated_data["created_by"] = self.context["request"].user
        project = super().create(validated_data)
        if assigned_users:
            project.assigned_users.set(assigned_users)
        return project

    def update(self, instance, validated_data):
        assigned_users = validated_data.pop("assigned_users", None)
        project = super().update(instance, validated_data)
        if assigned_users is not None:
            project.assigned_users.set(assigned_users)
        return project
