from django.test import SimpleTestCase

from .schemas import ToolInputError, validate_input


class AIToolValidationTests(SimpleTestCase):
    def test_rejects_unexpected_arguments(self):
        with self.assertRaises(ToolInputError):
            validate_input({"employee_id": "secret"}, {"limit"})

    def test_rejects_large_limits(self):
        with self.assertRaises(ToolInputError):
            validate_input({"limit": 51}, {"limit"})

    def test_rejects_invalid_date_range(self):
        with self.assertRaises(ToolInputError):
            validate_input({"from_date": "2026-07-02", "to_date": "2026-07-01"}, {"from_date", "to_date"})
