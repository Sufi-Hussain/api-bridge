from django.test import TestCase

from . import models, serializers


class HRTests(TestCase):
    def test_import(self):
        from . import views  # noqa: F401
