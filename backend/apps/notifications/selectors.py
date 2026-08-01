from .models import Notification


def for_user(user):
    return Notification.objects.filter(user=user)
