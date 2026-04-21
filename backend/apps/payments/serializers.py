from rest_framework import serializers
from django.conf import settings

from .models import Payment, MonthlyChitWinner
from apps.users.serializers import UserMinimalSerializer
from apps.chitgroups.serializers import ChitGroupListSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment serializer with nested details."""
    user_detail = UserMinimalSerializer(source='user', read_only=True)
    chitgroup_name = serializers.CharField(source='chitgroup.name', read_only=True)
    screenshot_full_url = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'chitgroup', 'chitgroup_name', 'amount_paid',
            'screenshot_url', 'screenshot_full_url', 'payment_month',
            'created_at', 'updated_at', 'user_detail',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'screenshot_url']

    def get_screenshot_full_url(self, obj):
        if obj.screenshot_url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f"{settings.MEDIA_URL}{obj.screenshot_url}")
            return f"{settings.MEDIA_URL}{obj.screenshot_url}"
        return None


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating payments."""

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'chitgroup', 'amount_paid',
            'screenshot_url', 'payment_month',
        ]
        read_only_fields = ['id', 'screenshot_url']


class MonthlyChitWinnerSerializer(serializers.ModelSerializer):
    """Serializer for monthly chit winners."""
    user_detail = UserMinimalSerializer(source='user', read_only=True)
    chitgroup_name = serializers.CharField(source='chitgroup.name', read_only=True)
    payment_confirmation_full_url = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyChitWinner
        fields = [
            'id', 'user', 'chitgroup', 'chitgroup_name',
            'total_amount_won', 'month', 'payment_confirmation_url',
            'payment_confirmation_full_url', 'created_at', 'user_detail',
        ]
        read_only_fields = ['id', 'created_at', 'payment_confirmation_url']

    def get_payment_confirmation_full_url(self, obj):
        if hasattr(obj, 'payment_confirmation_url') and obj.payment_confirmation_url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f"{settings.MEDIA_URL}{obj.payment_confirmation_url}")
            return f"{settings.MEDIA_URL}{obj.payment_confirmation_url}"
        return None
