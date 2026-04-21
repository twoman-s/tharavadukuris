from django.urls import path
from .views import DashboardView, PaymentReportView

urlpatterns = [
    path('reports/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('reports/payments/', PaymentReportView.as_view(), name='payment_reports'),
]
