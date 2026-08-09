from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Iterable, Protocol

from django.conf import settings


@dataclass
class ProviderError(Exception):
    code: str
    message: str


class LLMProvider(Protocol):
    def chat(self, messages: Iterable[dict[str, str]], tools=None): ...


class OpenAIProvider:
    name = "openai"

    def __init__(self) -> None:
        self.base_url = settings.AI_OPENAI_BASE_URL
        self.model = settings.AI_OPENAI_MODEL
        self.api_key = settings.AI_OPENAI_API_KEY

    def chat(self, messages: Iterable[dict[str, str]]) -> str:
        print(f"OpenAIProvider.chat called with messages: {messages}")
        return _chat_completion(self.base_url, self.model, self.api_key, messages)


class DeepSeekProvider:
    name = "deepseek"

    def __init__(self) -> None:
        self.base_url = settings.AI_DEEPSEEK_BASE_URL
        self.model = settings.AI_DEEPSEEK_MODEL
        self.api_key = settings.AI_DEEPSEEK_API_KEY

    def chat(self, messages: Iterable[dict[str, str]]) -> str:
        print(f"DeepSeekProvider.chat called with messages: {messages}")
        return _chat_completion(self.base_url, self.model, self.api_key, messages)


def _chat_completion(base_url: str, model: str, api_key: str, messages: Iterable[dict[str, str]], tools=None):
    if not api_key:
        raise ProviderError("provider_unconfigured", "AI provider is not configured.")
    payload = {"model": model, "messages": list(messages), "temperature": 0.2}
    if tools:
        payload["tools"] = tools
    body = json.dumps(payload).encode()
    request = urllib.request.Request(
        f"{base_url}/chat/completions", data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=settings.AI_REQUEST_TIMEOUT) as response:
            payload = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code == 429:
            raise ProviderError("provider_rate_limited", "The AI provider is temporarily rate limited.") from exc
        raise ProviderError("provider_error", "The AI provider returned an error.") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise ProviderError("provider_timeout", "The AI provider did not respond in time.") from exc
    try:
        message = payload["choices"][0]["message"]
        return message if message.get("tool_calls") else str(message.get("content", ""))
    except (KeyError, IndexError, TypeError) as exc:
        raise ProviderError("provider_malformed", "The AI provider returned an invalid response.") from exc
