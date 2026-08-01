from django.test import TestCase

from .services import create_user


class UserTests(TestCase):
    def test_create_user(self):
        user = create_user(email="a@b.com", password="pw12345!")
        self.assertEqual(user.email, "a@b.com")
        self.assertTrue(user.check_password("pw12345!"))
