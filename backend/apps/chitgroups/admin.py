from django.contrib import admin
from .models import ChitGroup, UserChitAllocation


@admin.register(ChitGroup)
class ChitGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_amount', 'individual_chit_amount', 'start_date', 'end_date']
    search_fields = ['name']


@admin.register(UserChitAllocation)
class UserChitAllocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'chitgroup', 'number_of_chits', 'total_chit_amount']
    list_filter = ['chitgroup']
