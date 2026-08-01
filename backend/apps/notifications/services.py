from .models import Notification


def mark_read(notification: Notification) -> Notification:
    if not notification.read:
        notification.read = True
        notification.save(update_fields=["read", "updated_at"])
    return notification
