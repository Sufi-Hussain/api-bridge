// System Administration & IT. The Django backend does not currently
// expose any admin endpoints, so every method here delegates to the mock.
// When admin APIs come online, swap the bodies (or add a `USE_MOCKS`
// short-circuit like the other services) — signatures do not need to change.

export * from "./_mocks/admin.mock";
