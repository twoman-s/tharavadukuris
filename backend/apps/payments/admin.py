from django.contrib import admin
from .models import Payment, MonthlyChitWinner


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'chitgroup', 'amount_paid', 'payment_month', 'screenshot_url']
    list_filter = ['chitgroup', 'payment_month']
    search_fields = ['user__username']


@admin.register(MonthlyChitWinner)
class MonthlyChitWinnerAdmin(admin.ModelAdmin):
    list_display = ['user', 'chitgroup', 'total_amount_won', 'month']
    list_filter = ['chitgroup', 'month']
