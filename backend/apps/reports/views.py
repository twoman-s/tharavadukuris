from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone

from apps.chitgroups.models import ChitGroup, UserChitAllocation
from apps.payments.models import Payment, MonthlyChitWinner
from apps.users.models import User


class DashboardView(APIView):
    """Dashboard statistics for admin and users."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        current_month = now.strftime('%Y-%m')

        if user.is_admin_user:
            # Admin dashboard
            total_groups = ChitGroup.objects.count()
            total_users = User.objects.filter(is_active=True).count()

            # Current month collection
            current_month_start = now.replace(day=1).date()
            monthly_collection = Payment.objects.filter(
                payment_month=current_month_start
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            # Total collected overall
            total_collected = Payment.objects.aggregate(
                total=Sum('amount_paid')
            )['total'] or 0

            # Recent payments
            recent_payments_count = Payment.objects.filter(
                payment_month=current_month_start
            ).count()

            # Total winners allocated
            total_winners = MonthlyChitWinner.objects.count()

            return Response({
                'total_groups': total_groups,
                'total_users': total_users,
                'monthly_collection': str(monthly_collection),
                'total_collected': str(total_collected),
                'recent_payments_count': recent_payments_count,
                'total_winners': total_winners,
                'current_month': current_month,
            })
        else:
            # User dashboard
            user_groups = ChitGroup.objects.filter(
                allocations__user=user
            ).distinct().count()

            user_total_paid = Payment.objects.filter(
                user=user
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            user_allocations = UserChitAllocation.objects.filter(
                user=user
            ).count()

            user_wins = MonthlyChitWinner.objects.filter(
                user=user
            ).count()

            # Total chit amount (monthly contribution)
            total_monthly = UserChitAllocation.objects.filter(
                user=user
            ).aggregate(total=Sum('total_chit_amount'))['total'] or 0

            return Response({
                'my_groups': user_groups,
                'my_allocations': user_allocations,
                'total_paid': str(user_total_paid),
                'total_wins': user_wins,
                'monthly_contribution': str(total_monthly),
                'current_month': current_month,
            })


class PaymentReportView(APIView):
    """Payment reports with filtering."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Payment.objects.select_related('user', 'chitgroup')

        if not user.is_admin_user:
            qs = qs.filter(user=user)

        # Filters
        chitgroup_id = request.query_params.get('chitgroup')
        month = request.query_params.get('month')  # YYYY-MM format
        year = request.query_params.get('year')
        user_id = request.query_params.get('user_id')

        if chitgroup_id:
            qs = qs.filter(chitgroup_id=chitgroup_id)
        if month:
            # month = 'YYYY-MM', filter by that month
            try:
                parts = month.split('-')
                qs = qs.filter(
                    payment_month__year=int(parts[0]),
                    payment_month__month=int(parts[1]),
                )
            except (ValueError, IndexError):
                pass
        if year:
            qs = qs.filter(payment_month__year=int(year))
        if user_id and user.is_admin_user:
            qs = qs.filter(user_id=user_id)

        # Aggregation by user
        user_summary = qs.values(
            'user__id', 'user__username', 'user__first_name', 'user__last_name'
        ).annotate(
            total_paid=Sum('amount_paid'),
            payment_count=Count('id'),
        ).order_by('user__username')

        # Group summary
        group_summary = qs.values(
            'chitgroup__id', 'chitgroup__name'
        ).annotate(
            total_collected=Sum('amount_paid'),
            payment_count=Count('id'),
        ).order_by('chitgroup__name')

        return Response({
            'total_payments': qs.count(),
            'total_amount': str(qs.aggregate(total=Sum('amount_paid'))['total'] or 0),
            'by_user': list(user_summary),
            'by_group': list(group_summary),
        })
