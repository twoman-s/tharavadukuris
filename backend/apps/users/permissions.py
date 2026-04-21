from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin_user


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to the owner of the object or admin users."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        # Check if the object has a 'user' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # If the object IS a user
        if hasattr(obj, 'username'):
            return obj == request.user
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to all authenticated users, write access only to admins."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_admin_user
