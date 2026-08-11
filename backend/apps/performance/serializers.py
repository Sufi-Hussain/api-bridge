from __future__ import annotations

from rest_framework import serializers

from .models import Goal, KeyResult, Review

_GOAL_STATUS = {
    "on_track": "on-track",
    "at_risk": "at-risk",
    "off_track": "behind",
    "completed": "achieved",
}
_REVIEW_STATUS = {
    "not_started": "self-review",
    "in_progress": "self-review",
    "submitted": "manager-review",
    "calibrated": "calibration",
    "shared": "shared",
    "acknowledged": "acknowledged",
}


class KeyResultSerializer(serializers.ModelSerializer):
    text = serializers.CharField(source="title", read_only=True)

    class Meta:
        model = KeyResult
        fields = ("id", "text", "progress")


class MyGoalSerializer(serializers.ModelSerializer):
    key_results = KeyResultSerializer(many=True, read_only=True)
    due_date = serializers.DateField(source="due", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = (
            "id",
            "title",
            "description",
            "category",
            "progress",
            "status",
            "due_date",
            "weight",
            "key_results",
        )

    def get_status(self, obj) -> str:
        return _GOAL_STATUS.get(obj.status, obj.status)


class MyReviewSerializer(serializers.ModelSerializer):
    cycle = serializers.CharField(source="cycle.name", read_only=True)
    overall_rating = serializers.SerializerMethodField()
    submitted_on = serializers.DateField(source="submitted_at", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "id",
            "cycle",
            "reviewer",
            "reviewer_title",
            "overall_rating",
            "submitted_on",
            "status",
            "strengths",
            "improvements",
        )

    def get_overall_rating(self, obj) -> float:
        rating = obj.final_rating or obj.manager_rating or obj.self_rating or 0
        return float(rating)

    def get_status(self, obj) -> str:
        return _REVIEW_STATUS.get(obj.status, obj.status)
