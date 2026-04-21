from django.urls import path
from .views import (
    ChitGroupListCreateView,
    ChitGroupDetailView,
    AllocationListCreateView,
    AllocationDetailView,
    UserAllocationsView,
)

urlpatterns = [
    path('chitgroups/', ChitGroupListCreateView.as_view(), name='chitgroup_list_create'),
    path('chitgroups/<int:pk>/', ChitGroupDetailView.as_view(), name='chitgroup_detail'),
    path('chitgroups/<int:chitgroup_id>/allocations/', AllocationListCreateView.as_view(), name='allocation_list_create'),
    path('allocations/<int:pk>/', AllocationDetailView.as_view(), name='allocation_detail'),
    path('my-allocations/', UserAllocationsView.as_view(), name='user_allocations'),
]
