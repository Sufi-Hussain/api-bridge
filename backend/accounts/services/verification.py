"""
Email verification service.
"""
from __future__ import annotations

from django.utils import timezone

from accounts.models import OneTimeToken


class InvalidOrExpiredToken(Exception):
    pass


def verify_email(raw_token: str):
    """
    Validates a raw email-verification token, marks the associated user's
    email as verified, and consumes the token so it can't be reused.
    Returns the verified User instance.
    """
    from accounts.services import token_service  # avoid circular import

    token_obj = token_service.validate(raw_token, kind=OneTimeToken.Kind.EMAIL_VERIFY)
    if token_obj is None:
        raise InvalidOrExpiredToken("This verification link is invalid or has expired.")

    user = token_obj.user
    if not user.email_verified:
        user.email_verified = True
        user.save(update_fields=["email_verified"])

    token_obj.used_at = timezone.now()
    token_obj.save(update_fields=["used_at"])

    return user