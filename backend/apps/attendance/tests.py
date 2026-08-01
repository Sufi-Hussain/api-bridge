from django.test import TestCase

from . import models, services


class AttendanceTests(TestCase):
    def test_import(self):
        from . import views  # noqa: F401
