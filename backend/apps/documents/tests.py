from django.test import TestCase

from . import models, serializers


class DocumentsTests(TestCase):
    def test_import(self):
        from . import views  # noqa: F401
