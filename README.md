# Branch Cleanup

Smart Git branch cleanup CLI that detects squash-merged branches with interactive deletion.

## Features

- 🔍 **Detects all types of merged branches**: Regular merged + squash-merged (GitHub's default)
- 🎯 **Interactive deletion**: Safe confirmation prompts for each branch
- 🛡️ **Safety checks**: Protected branch detection and dry-run mode
- 📊 **Clear status display**: Shows branch type and safety status
- ⚡ **Fast and lightweight**: Minimal dependencies, focused on core functionality

## Installation

```bash
npm install -g branchcleanup
```

## Usage

### List branches

```bash
# List all branches with their status
branchcleanup list

# List with custom stale threshold (60 days)
branchcleanup list --stale-threshold=60
```

### Interactive cleanup

```bash
# Interactive cleanup with confirmation prompts
branchcleanup cleanup

# Dry run - show what would be deleted
branchcleanup cleanup --dry-run

# Force delete (bypass confirmation)
branchcleanup cleanup --force
```

### Options

```bash
# Show help
branchcleanup --help

# Show version
branchcleanup --version
```

## Examples

### List branches

```
$ branchcleanup list
┌─────────────────────┬──────────────┬──────────────┐
│ Branch              │ Type         │ Safe to Delete│
├─────────────────────┼──────────────┼──────────────┤
│ feature/user-auth  │ squash-merged│ ✅ Yes       │
│ bugfix/login-page   │ merged       │ ✅ Yes       │
│ experiment/new-ui   │ stale-30d    │ ❌ No (old)   │
└─────────────────────┴──────────────┴──────────────┘
```

### Interactive cleanup

```
$ branchcleanup cleanup
❓ Delete feature/user-auth (squash-merged)? [y/N] y
✅ Deleted feature/user-auth
❓ Delete bugfix/login-page (merged)? [y/N] y  
✅ Deleted bugfix/login-page
❓ Delete experiment/new-ui ( stale-30d)? [y/N] n
📝 Skipping experiment/new-ui (user declined)
```

## Development

```bash
# Clone the repository
git clone https://github.com/sulthonzh/branchcleanup.git
cd branchcleanup

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## How It Works

### Branch Detection

The tool detects three types of branches:

1. **Merged branches**: Detected using `git branch --merged`
2. **Squash-merged branches**: Detected by checking if all commits from the branch exist in the target branch
3. **Stale branches**: Branches not touched in the specified number of days (default: 30)

### Safety Features

- **Protected branch detection**: Never deletes `main`, `master`, or other protected branches
- **Confirmation prompts**: Interactive confirmation for each deletion
- **Dry-run mode**: Preview what would be deleted without actually deleting
- **Force mode**: Bypass confirmation for bulk operations

## License

MIT