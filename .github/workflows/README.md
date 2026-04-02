# GitHub Actions Workflow Setup

This document explains how to set up the GitHub Actions workflow for automatic Apps Script deployment.

## Required Secrets

### Repository Secrets (Settings → Secrets and variables → Actions)

#### 1. `CLASP_CREDENTIALS`
Google Service Account credentials for clasp authentication.

**How to get it (Recommended - Service Account):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new Service Account or use existing one
3. Generate JSON key
4. Copy the entire JSON content
5. Paste as `CLASP_CREDENTIALS` secret

**Alternative (OAuth - from docs/CICD.md):**
```bash
# Login with clasp
clasp login --no-localhost

# Get credentials from file
cat ~/.clasprc.json  # Linux/Mac
# or
type %USERPROFILE%\.clasprc.json  # Windows

# Copy entire JSON content to CLASP_CREDENTIALS secret
```

#### 2. `SCRIPT_ID`
Your Google Apps Script project ID.

**How to get it:**
- In Apps Script Editor: **Project Settings** → **IDs** → **Script ID**
- Or from `SheetFlow.AppScript/.clasp.json` file: `"scriptId": "your_script_id"`

#### 3. `DEPLOYMENT_ID` (New - for Fixed URL)
Your web app deployment ID to maintain fixed URL.

**How to get it:**
- In Apps Script Editor: **Deploy** → **Manage deployments**
- Find your web app deployment (usually Version 2)
- Copy the deployment ID (format: `AKfycb...`)
- This ensures URL never changes when updating code

## Workflow Features

### Automatic Deployment
- Triggers on push to `main` branch
- Ignores changes to docs and README
- Pushes code to Apps Script
- Updates existing deployment (fixed URL)
- Validates deployment connectivity

### Fixed URL Approach
Instead of creating new deployments (which change URLs), the workflow:
1. Updates existing deployment with new code
2. Maintains the same URL for mobile app
3. Provides deployment validation

## Setup Steps

1. **Create Google Service Account:**
   ```bash
   # Follow clasp authentication setup
   clasp login --creds creds.json
   ```

2. **Add Repository Secrets:**
   - `CLASP_CREDENTIALS`: Service account JSON
   - `SCRIPT_ID`: Apps Script project ID
   - `DEPLOYMENT_ID`: Web app deployment ID

3. **Test Workflow:**
   - Push to `main` branch
   - Check Actions tab for deployment status
   - Verify fixed URL still works

## Troubleshooting

### Deployment Fails
- Check `CLASP_CREDENTIALS` is valid JSON
- Verify `SCRIPT_ID` matches your Apps Script project
- Ensure `DEPLOYMENT_ID` exists and is active

### URL Changes
- Make sure you're updating deployment, not creating new one
- Check that `DEPLOYMENT_ID` secret is set correctly
- Verify deployment type is "Web app" not "Library"

### Validation Fails
- 404 error means deployment URL is wrong
- Check if deployment is properly configured as web app
- Verify "Execute as" and "Who has access" settings
