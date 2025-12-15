# GitHub Actions Configuration

This directory contains GitHub Actions workflows for the TIL static site generation and deployment.

## Workflows

### 1. build-deploy.yml (Target Repository)

This workflow runs in the `til-pages` repository and handles:
- Building the static site from TIL content
- Running tests before deployment
- Deploying to GitHub Pages

**Triggers:**
- `repository_dispatch` events with type `til-updated` from source repository
- Manual workflow dispatch
- Pushes to main branch (for testing)

**Requirements:**
- GitHub Pages must be enabled in repository settings
- Pages source should be set to "GitHub Actions"
- No additional secrets required (uses built-in `GITHUB_TOKEN`)

### 2. trigger-til-pages-build.yml (Source Repository)

This workflow should be placed in the source TIL repository (`zhaochunqi/til`) and handles:
- Detecting changes to TIL content in `notes/` directory
- Triggering builds in the target repository

**Requirements:**
- Requires a Personal Access Token (PAT) with `repo` scope
- PAT should be stored as `PAGES_TRIGGER_TOKEN` secret in source repository
- Target repository must allow repository dispatch events

## Setup Instructions

### 1. Target Repository (til-pages) Setup

1. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - No additional configuration needed

2. The workflow will automatically:
   - Fetch content from source repository
   - Build the static site
   - Deploy to GitHub Pages

### 2. Source Repository (til) Setup

1. Create a Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` scope
   - Copy the token value

2. Add the token as a secret:
   - Go to source repository Settings → Secrets and variables → Actions
   - Add new repository secret named `PAGES_TRIGGER_TOKEN`
   - Paste the token value

3. Copy the trigger workflow:
   - Copy `trigger-til-pages-build.yml` to `.github/workflows/` in source repository
   - Commit and push the changes

### 3. Testing the Setup

1. Make a change to any file in the `notes/` directory of source repository
2. Push the changes to main branch
3. Check Actions tab in both repositories:
   - Source repo should show "Trigger TIL Pages Build" workflow
   - Target repo should show "Build and Deploy TIL Site" workflow
4. Verify the site updates at your GitHub Pages URL

## Workflow Features

### Error Handling
- Build failures are logged and reported
- Previous working version remains deployed if build fails
- Notification job runs on failure

### Performance Optimizations
- Uses pnpm for faster dependency installation
- Caches dependencies between runs
- Shallow clone of source repository for faster fetching

### Security
- Uses minimal required permissions
- No custom secrets required for target repository
- Source repository only needs PAT for triggering builds

## Troubleshooting

### Common Issues

1. **Build fails with "source directory not found"**
   - Check that source repository URL is correct
   - Verify source repository is public or accessible

2. **Trigger workflow doesn't run**
   - Verify `PAGES_TRIGGER_TOKEN` secret is set correctly
   - Check that token has `repo` scope
   - Ensure workflow file is in correct location

3. **Pages deployment fails**
   - Verify GitHub Pages is enabled
   - Check that Pages source is set to "GitHub Actions"
   - Review build logs for specific errors

4. **Content not updating**
   - Check that changes are in `notes/` directory
   - Verify both workflows completed successfully
   - Clear browser cache and check again

### Manual Triggering

Both workflows can be triggered manually:
- Go to Actions tab in respective repository
- Select the workflow
- Click "Run workflow" button