from django.test import TestCase

from . import models


class CommonTests(TestCase):
    def test_import(self):
        from . import permissions  # noqa: F401
