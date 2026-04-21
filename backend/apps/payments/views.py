from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Payment, MonthlyChitWinner
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    MonthlyChitWinnerSerializer,
)
from .utils import rename_and_save_screenshot, rename_and_save_winner_screenshot
from apps.users.permissions import IsAdminUser, IsAdminOrReadOnly, IsOwnerOrAdmin


class PaymentListCreateView(generics.ListCreateAPIView):
    """List payments or create a new payment."""
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'chitgroup': ['exact'],
        'user': ['exact'],
        'payment_month': ['exact', 'gte', 'lte'],
    }

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('user', 'chitgroup')
        if not user.is_admin_user:
            qs = qs.filter(user=user)
        return qs


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a payment."""
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('user', 'chitgroup')
        if not user.is_admin_user:
            qs = qs.filter(user=user)
        return qs


class PaymentUploadScreenshotView(APIView):
    """Upload a screenshot for a payment."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check permissions: admin or owner
        if not request.user.is_admin_user and payment.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN,
            )

        screenshot = request.FILES.get('screenshot')
        if not screenshot:
            return Response(
                {'error': 'No screenshot file provided'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if screenshot.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type. Allowed: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save with custom naming
        relative_path = rename_and_save_screenshot(payment, screenshot)
        payment.screenshot_url = relative_path
        payment.save(update_fields=['screenshot_url'])

        serializer = PaymentSerializer(payment, context={'request': request})
        return Response(serializer.data)


class MonthlyChitWinnerListCreateView(generics.ListCreateAPIView):
    """List winners or allocate a new winner."""
    serializer_class = MonthlyChitWinnerSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'chitgroup': ['exact'],
        'month': ['exact'],
        'user': ['exact'],
    }

    def get_queryset(self):
        return MonthlyChitWinner.objects.select_related('user', 'chitgroup')


class MonthlyChitWinnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a winner entry."""
    serializer_class = MonthlyChitWinnerSerializer
    permission_classes = [IsAdminUser]
    queryset = MonthlyChitWinner.objects.all()

class WinnerUploadScreenshotView(APIView):
    """Upload a payment confirmation screenshot for a winner."""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            winner = MonthlyChitWinner.objects.get(pk=pk)
        except MonthlyChitWinner.DoesNotExist:
            return Response(
                {'error': 'Winner not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        screenshot = request.FILES.get('screenshot')
        if not screenshot:
            return Response(
                {'error': 'No screenshot file provided'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if screenshot.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type. Allowed: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save with custom naming
        relative_path = rename_and_save_winner_screenshot(winner, screenshot)
        winner.payment_confirmation_url = relative_path
        winner.save(update_fields=['payment_confirmation_url'])

        serializer = MonthlyChitWinnerSerializer(winner, context={'request': request})
        return Response(serializer.data)
