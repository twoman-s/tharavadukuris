from django.db import models
from django.conf import settings


class Payment(models.Model):
    """Monthly payment record for a user in a chit group."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    chitgroup = models.ForeignKey(
        'chitgroups.ChitGroup',
        on_delete=models.CASCADE,
        related_name='payments',
    )
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    screenshot_url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text='Relative path to the uploaded screenshot',
    )
    payment_month = models.DateField(
        help_text='First day of the payment month (YYYY-MM-01)',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-payment_month', '-created_at']
        unique_together = ('user', 'chitgroup', 'payment_month')

    def __str__(self):
        return f"{self.user.username} - {self.chitgroup.name} - {self.payment_month}"

    @property
    def screenshot_full_url(self):
        """Return the full media URL for the screenshot."""
        if self.screenshot_url:
            return f"{settings.MEDIA_URL}{self.screenshot_url}"
        return None


class MonthlyChitWinner(models.Model):
    """Record of monthly chit winner."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chit_wins',
    )
    chitgroup = models.ForeignKey(
        'chitgroups.ChitGroup',
        on_delete=models.CASCADE,
        related_name='winners',
    )
    total_amount_won = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.CharField(
        max_length=7,
        help_text='Format: YYYY-MM',
    )
    payment_confirmation_url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text='Relative path to the uploaded payment confirmation screenshot',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chitgroup', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.user.username} won {self.total_amount_won} in {self.month}"

    @property
    def payment_confirmation_full_url(self):
        """Return the full media URL for the payment confirmation screenshot."""
        if self.payment_confirmation_url:
            return f"{settings.MEDIA_URL}{self.payment_confirmation_url}"
        return None


