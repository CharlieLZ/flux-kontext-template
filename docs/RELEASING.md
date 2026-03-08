# Releasing

## Versioning

- Use semantic versions for tagged releases.
- Tag from the default branch after the release candidate is merged.
- Do not tag feature branches or partially reviewed work.

## Minimum Release Checklist

1. Merge the release-ready pull requests into the default branch.
2. Update `CHANGELOG.md`.
3. Run `npm ci`, `npm run build`, and `npm run lint`.
4. Confirm new environment variables are documented in `env.example`.
5. Create and push the tag, then publish GitHub release notes.

## Suggested First Tag

- `v0.1.0` for the first maintained template release
