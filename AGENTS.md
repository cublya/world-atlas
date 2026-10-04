# Repository Guidelines

## Search for Existing Solutions and Tools First

When a task arrives, the first move is a search, not a design. Assume the problem is already solved and go find out where.

- **Search this repo.** Grep the domain nouns and their near-synonyms, then read the module that owns the area. The file tree hides more than it shows.
- **Search what is already installed.** Read the manifests and lockfiles before adding anything. The capability is often sitting in a dependency already paid for.
- **Search outside.** Look for a maintained library, tool, or CLI that does the job, and read its current docs rather than trusting a memory of its API. Prefer boring and widely used over clever.
- **Extend, do not parallel.** A second implementation of the same idea is a fork waiting to diverge. When something is close but wrong, change it in place and delete what it supersedes.
- **Hand-roll only when you can name why nothing else fits,** and say so in the summary of the change.

## Writing Style

Do not use em dashes in code, comments, documentation, or user-facing text. Rewrite the sentence with commas, colons, semicolons, parentheses, or separate sentences instead.
