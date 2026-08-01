# from __future__ import annotations

# import uuid

# from django.contrib.auth.models import AbstractUser
# from django.db import models


# class Role(models.TextChoices):
#     EMPLOYEE = "employee", "Employee"
#     MANAGER = "manager", "Manager"
#     HR = "hr", "HR"
#     ADMIN = "admin", "Admin"


# class User(AbstractUser):
#     """Custom user with UUID PK, email login and role."""

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     email = models.EmailField(unique=True)
#     role = models.CharField(max_length=16, choices=Role.choices, default=Role.EMPLOYEE)
#     avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["username"]

#     def __str__(self) -> str:  # pragma: no cover - trivial
#         return self.email
