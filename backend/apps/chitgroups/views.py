from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ChitGroup, UserChitAllocation
from .serializers import (
    ChitGroupSerializer,
    ChitGroupListSerializer,
    UserChitAllocationSerializer,
    UserChitAllocationCreateSerializer,
)
from apps.users.permissions import IsAdminUser, IsAdminOrReadOnly


class ChitGroupListCreateView(generics.ListCreateAPIView):
    """List all chit groups or create a new one."""
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChitGroupSerializer
        return ChitGroupListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return ChitGroup.objects.all()
        # Regular users only see groups they are allocated to
        return ChitGroup.objects.filter(
            allocations__user=user
        ).distinct()


class ChitGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a chit group."""
    serializer_class = ChitGroupSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return ChitGroup.objects.all()
        return ChitGroup.objects.filter(
            allocations__user=user
        ).distinct()


class AllocationListCreateView(generics.ListCreateAPIView):
    """List allocations for a chit group or create a new one."""
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserChitAllocationCreateSerializer
        return UserChitAllocationSerializer

    def get_queryset(self):
        chitgroup_id = self.kwargs.get('chitgroup_id')
        user = self.request.user
        qs = UserChitAllocation.objects.filter(chitgroup_id=chitgroup_id)
        if not user.is_admin_user:
            qs = qs.filter(user=user)
        return qs.select_related('user', 'chitgroup')

    def perform_create(self, serializer):
        chitgroup_id = self.kwargs.get('chitgroup_id')
        serializer.save(chitgroup_id=chitgroup_id)


class AllocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an allocation."""
    serializer_class = UserChitAllocationCreateSerializer
    permission_classes = [IsAdminUser]
    queryset = UserChitAllocation.objects.all()


class UserAllocationsView(generics.ListAPIView):
    """List all allocations for the current user."""
    serializer_class = UserChitAllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserChitAllocation.objects.filter(
            user=self.request.user
        ).select_related('user', 'chitgroup')
