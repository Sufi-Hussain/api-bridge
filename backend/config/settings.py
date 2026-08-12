"""Django settings for the HRMS backend."""
from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# print("BASE_DIR:", BASE_DIR)
# print(".env exists:", (BASE_DIR / ".env").exists())
load_dotenv(BASE_DIR / ".env")


def _env_bool(key: str, default: bool = False) -> bool:
    return os.getenv(key, str(default)).lower() in {"1", "true", "yes", "on"}


def _env_list(key: str, default: str = "") -> list[str]:
    raw = os.getenv(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-dev-key")
DEBUG = _env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = _env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,*")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@hirechamps.com")

# AI provider configuration. OpenAI is the default; DeepSeek remains an explicit fallback.
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()
AI_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
AI_OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
AI_DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
AI_DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
AI_DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
AI_REQUEST_TIMEOUT = int(os.getenv("AI_REQUEST_TIMEOUT", "45"))
AI_MAX_HISTORY = int(os.getenv("AI_MAX_HISTORY", "12"))
AI_MAX_MESSAGE_LENGTH = int(os.getenv("AI_MAX_MESSAGE_LENGTH", "4000"))
# print(f"AI_PROVIDER={AI_PROVIDER}, AI_OPENAI_MODEL={AI_OPENAI_MODEL}, AI_DEEPSEEK_MODEL={AI_DEEPSEEK_MODEL}")
# print(f"AI_OPENAI_BASE_URL={AI_OPENAI_BASE_URL}, AI_DEEPSEEK_BASE_URL={AI_DEEPSEEK_BASE_URL}")
# print(f"OPENAI_API_KEY='{AI_OPENAI_API_KEY[:4]}...{AI_OPENAI_API_KEY[-4:]}'")
# print(f"DEEPSEEK_API_KEY='{AI_DEEPSEEK_API_KEY[:4]}...{AI_DEEPSEEK_API_KEY[-4:]}'")
# print(os.getenv("CHECK", "Environment variable CHECK not set."))

# Dev: prints emails to console instead of actually sending
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
# Prod: swap to SMTP or a provider backend (SES, SendGrid, etc.)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    "corsheaders",
    # Local
    "apps.common",
    # "apps.users",
    "apps.ess",
    "apps.hr",
    "apps.leave",
    "apps.attendance",
    "apps.payroll",
    "apps.assets",
    "apps.benefits",
    "apps.learning",
    "apps.performance",
    "apps.documents",
    "apps.compensation",
    "apps.ai",
    "apps.notifications",

    "accounts",
    "audit",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "accounts.middleware.OrganizationMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "hrms"),
        "USER": os.getenv("DB_USER", "hrms"),
        "PASSWORD": os.getenv("DB_PASSWORD", "hrms"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# AUTH_USER_MODEL = "users.User"
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "user": "600/min",
        "login": "10/min",           # tight bucket for LoginView
        "password_reset": "5/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "60"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "HRMS API",
    "DESCRIPTION": "Enterprise HRMS backend replacing frontend mock services.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# CORS_ALLOWED_ORIGINS = _env_list(
#     "CORS_ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080"
# )
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.137.1:8080",  # Your frontend origin
    "http://127.0.0.1:8080"
]

CORS_ALLOW_CREDENTIALS = True
# --- CORS --------------------------------------------------------------------
# CORS_ALLOWED_ORIGINS = ["https://your-frontend.example.com"]
# CORS_ALLOW_CREDENTIALS = True
# CSRF_TRUSTED_ORIGINS = ["https://your-frontend.example.com"]
