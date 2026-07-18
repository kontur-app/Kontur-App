from rest_framework import serializers
from .models import Meeting, MeetingNote
from django.contrib.auth.models import User


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class MeetingNoteSerializer(serializers.ModelSerializer):
    author_detail = UserBriefSerializer(source="author", read_only=True)

    class Meta:
        model = MeetingNote
        fields = "__all__"


class MeetingSerializer(serializers.ModelSerializer):
    notes = MeetingNoteSerializer(many=True, read_only=True)
    created_by_detail = UserBriefSerializer(source="created_by", read_only=True)
    organizer_detail = UserBriefSerializer(source="organizer", read_only=True)

    class Meta:
        model = Meeting
        fields = "__all__"

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        if not validated_data.get("organizer"):
            validated_data["organizer"] = self.context["request"].user
        return super().create(validated_data)
