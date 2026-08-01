"""
Transactional email helpers for the accounts app.
"""
from __future__ import annotations

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_verification_email(user, raw_token: str) -> None:
    verify_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={raw_token}"

    subject = "Verify your email address"
    context = {"user": user, "verify_url": verify_url}

    text_body = render_to_string("accounts/email/verify_email.txt", context)
    html_body = render_to_string("accounts/email/verify_email.html", context)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)


def send_password_reset_email(user, raw_token: str) -> None:
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={raw_token}"

    subject = "Reset your password"
    context = {"user": user, "reset_url": reset_url}

    text_body = render_to_string("accounts/email/reset_password.txt", context)
    html_body = render_to_string("accounts/email/reset_password.html", context)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)