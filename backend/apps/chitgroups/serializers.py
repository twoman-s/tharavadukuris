from rest_framework import serializers
from .models import ChitGroup, UserChitAllocation
from apps.users.serializers import UserMinimalSerializer


class UserChitAllocationSerializer(serializers.ModelSerializer):
    """Serializer for chit allocations."""
    user_detail = UserMinimalSerializer(source='user', read_only=True)
    monthly_contribution = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = UserChitAllocation
        fields = [
            'id', 'user', 'chitgroup', 'number_of_chits',
            'total_chit_amount', 'monthly_contribution', 'user_detail',
        ]
        read_only_fields = ['id', 'total_chit_amount']


class UserChitAllocationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating allocations."""

    class Meta:
        model = UserChitAllocation
        fields = ['id', 'user', 'chitgroup', 'number_of_chits', 'total_chit_amount']
        read_only_fields = ['id', 'total_chit_amount']


class ChitGroupSerializer(serializers.ModelSerializer):
    """Full chit group serializer with computed fields."""
    total_members = serializers.IntegerField(read_only=True)
    total_chits = serializers.IntegerField(read_only=True)
    allocations = UserChitAllocationSerializer(many=True, read_only=True)

    class Meta:
        model = ChitGroup
        fields = [
            'id', 'name', 'total_amount', 'individual_chit_amount',
            'start_date', 'end_date', 'total_members', 'total_chits',
            'allocations', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChitGroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    total_members = serializers.IntegerField(read_only=True)
    total_chits = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChitGroup
        fields = [
            'id', 'name', 'total_amount', 'individual_chit_amount',
            'start_date', 'end_date', 'total_members', 'total_chits',
        ]
