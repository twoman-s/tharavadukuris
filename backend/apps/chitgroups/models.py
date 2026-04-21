from django.db import models
from django.conf import settings


class ChitGroup(models.Model):
    """A chit fund group with members contributing monthly."""

    name = models.CharField(max_length=200)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    individual_chit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Amount per single chit unit per month',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_members(self):
        """Total number of unique members in this group."""
        return self.allocations.values('user').distinct().count()

    @property
    def total_chits(self):
        """Total number of chits allocated in this group."""
        from django.db.models import Sum
        result = self.allocations.aggregate(total=Sum('number_of_chits'))
        return result['total'] or 0


class UserChitAllocation(models.Model):
    """Tracks how many chits a user holds in a specific group."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chit_allocations',
    )
    chitgroup = models.ForeignKey(
        ChitGroup,
        on_delete=models.CASCADE,
        related_name='allocations',
    )
    number_of_chits = models.PositiveIntegerField(default=1)
    total_chit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Auto-calculated: number_of_chits × individual_chit_amount',
        editable=False,
        default=0,
    )

    class Meta:
        unique_together = ('user', 'chitgroup')
        ordering = ['chitgroup', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.chitgroup.name} ({self.number_of_chits} chits)"

    def save(self, *args, **kwargs):
        """Auto-calculate total_chit_amount before saving."""
        self.total_chit_amount = self.number_of_chits * self.chitgroup.individual_chit_amount
        super().save(*args, **kwargs)

    @property
    def monthly_contribution(self):
        """The amount this user pays per month (same as total_chit_amount)."""
        return self.total_chit_amount
