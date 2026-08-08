from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Iterable, Protocol


@dataclass
class ProviderError(Exception):
    code: str
    message: str


class LLMProvider(Protocol):
    def chat(self, messages: Iterable[dict[str, str]]) -> str: ...


class DeepSeekProvider:
    name = "deepseek"

    def __init__(self) -> None:
        self.base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")

    def chat(self, messages: Iterable[dict[str, str]]) -> str:
        if not self.api_key:
            raise ProviderError("provider_unconfigured", "AI provider is not configured.")
        body = json.dumps({"model": self.model, "messages": list(messages), "temperature": 0.2}).encode()
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions", data=body,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode())
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                raise ProviderError("provider_rate_limited", "The AI provider is temporarily rate limited.") from exc
            raise ProviderError("provider_error", "The AI provider returned an error.") from exc
        except (urllib.error.URLError, TimeoutError) as exc:
            raise ProviderError("provider_timeout", "The AI provider did not respond in time.") from exc
        try:
            return str(payload["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError) as exc:
            raise ProviderError("provider_malformed", "The AI provider returned an invalid response.") from exc
