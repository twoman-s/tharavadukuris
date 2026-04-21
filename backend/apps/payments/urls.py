from django.urls import path
from .views import (
    PaymentListCreateView,
    PaymentDetailView,
    PaymentUploadScreenshotView,
    MonthlyChitWinnerListCreateView,
    MonthlyChitWinnerDetailView,
    WinnerUploadScreenshotView,
)

urlpatterns = [
    path('payments/', PaymentListCreateView.as_view(), name='payment_list_create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('payments/<int:pk>/upload-screenshot/', PaymentUploadScreenshotView.as_view(), name='payment_upload_screenshot'),
    path('winners/', MonthlyChitWinnerListCreateView.as_view(), name='winner_list_create'),
    path('winners/<int:pk>/', MonthlyChitWinnerDetailView.as_view(), name='winner_detail'),
    path('winners/<int:pk>/upload-screenshot/', WinnerUploadScreenshotView.as_view(), name='winner_upload_screenshot'),
]
