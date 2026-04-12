# Google Drive Integration — Setup Guide

This guide covers how to set up Google Drive for photo uploads in the Verma Studios admin panel. Two authentication methods are supported:

| Method | Best For | Storage | Shared Drives |
|---|---|---|---|
| **OAuth 2.0** | Personal Gmail accounts | Your 15 GB personal quota | ❌ Not needed |
| **Service Account** | Google Workspace (business) | Shared Drive quota | ✅ Required |

**Choose your method** based on your Google account type and set the toggle in `.env`:

```env
# "oauth" for personal Gmail, "service_account" for Google Workspace
GOOGLE_DRIVE_AUTH_MODE=oauth
```

---

## Common Prerequisites (Both Methods)

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **"New Project"**
3. Name it (e.g. "Verma Studios") → **Create**
4. Select the new project from the dropdown

### 2. Enable Google Drive API

1. Go to **APIs & Services → Library**
2. Search for **"Google Drive API"**
3. Click it → **Enable**

### 3. Create a Root Folder in Google Drive

1. Open [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g. `Verma Studios Events`)
3. Open the folder — copy the **folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/XXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXX
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          This is your folder ID
   ```
4. Add it to `.env`:
   ```env
   GOOGLE_DRIVE_ROOT_FOLDER_ID=your_folder_id_here
   ```

---

## Method 1: OAuth 2.0 (Personal Gmail)

> ✅ **Use this if:** You have a personal `@gmail.com` account.
>
> The app authenticates *as you* using your Google account. Files are stored in your personal Google Drive and use your 15 GB free storage quota.

### Step 1: Configure OAuth Consent Screen

1. Go to [APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select **"External"** → **Create**
3. Fill in:
   - **App name:** `Verma Studios` (or any name)
   - **User support email:** your email
   - **Developer contact email:** your email
4. Click **Save and Continue** through the remaining steps
5. On the **"Audience"** / **"Test Users"** page:
   - Click **"+ ADD USERS"**
   - Add **your Gmail address** (e.g. `nitin.gupta71e@gmail.com`)
   - Save

> ⚠️ **Important:** Since the app is in "Testing" mode, only emails listed as test users can authorize. This is fine — only you (the admin) need to authorize.

### Step 2: Create OAuth Client ID

1. Go to [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **Desktop app**
4. Name: anything (e.g. `Verma Studio Upload`)
5. Click **Create**
6. **Copy** the **Client ID** and **Client Secret**

### Step 3: Add to `.env`

```env
GOOGLE_DRIVE_AUTH_MODE=oauth

GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Generate Refresh Token

Run the setup script from the backend directory:

```bash
cd backend
node setup-drive-oauth.js
```

This will:
1. Print a URL → **open it in your browser**
2. Sign in with your Gmail account
3. Click **"Allow"** to grant Drive access
4. Google shows an **authorization code** → **copy it**
5. Paste it in the terminal
6. The script prints your **`GOOGLE_REFRESH_TOKEN`**

### Step 5: Add Refresh Token to `.env`

```env
GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 6: Restart Backend

```bash
# Stop and restart the backend server
npm run dev
```

### ✅ Done! Your complete `.env` should have:

```env
GOOGLE_DRIVE_AUTH_MODE=oauth
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_folder_id
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### FAQ — OAuth Mode

**Q: Do I need to re-run the setup script every time?**
No. The refresh token is permanent. The Google library automatically refreshes access tokens behind the scenes.

**Q: When would I need to re-run it?**
Only if you manually revoke access from [Google Account → Security → Third-party apps](https://myaccount.google.com/permissions).

**Q: What if I get "Access blocked: app not verified"?**
Add your email as a test user in OAuth consent screen → Audience → Test Users.

---

## Method 2: Service Account (Google Workspace)

> ✅ **Use this if:** You have a Google Workspace (business) account with access to **Shared Drives**.
>
> A service account is a "robot" Google account. Since it has no personal storage, files are uploaded to a **Shared Drive** where the service account has been granted access.

> ⚠️ **Personal Gmail accounts CANNOT use this method** — Shared Drives are a Google Workspace feature only.

### Step 1: Create a Service Account

1. Go to [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"Service account"**
3. Fill in:
   - **Name:** `verma-studios-drive` (or any name)
   - **Description:** `Uploads event photos to Google Drive`
4. Click **Create and Continue**
5. Skip the optional "Grant access" steps → **Done**

### Step 2: Download the Key File

1. Click on the service account you just created
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **JSON** → **Create**
5. A `.json` file downloads — **rename it** to `credentials.json`
6. **Move it** to the `/backend` directory:
   ```
   backend/
     credentials.json   ← place it here
     services/
     routes/
     ...
   ```

### Step 3: Create a Shared Drive

1. Open [Google Drive](https://drive.google.com/)
2. In the left sidebar, find **"Shared Drives"**
3. Click **"+ New"** to create a Shared Drive (e.g. "Verma Studios Photos")

> If you don't see "Shared Drives", your Google Workspace admin may need to enable it, or you may be on a personal account (use OAuth mode instead).

### Step 4: Add the Service Account to the Shared Drive

1. Open the Shared Drive you created
2. Click **"Manage members"** (or the people icon)
3. Add the **service account email** as a member:
   - The email looks like: `verma-studios-drive@your-project.iam.gserviceaccount.com`
   - Find it in `credentials.json` → `client_email` field
4. Set role to **"Content Manager"** or **"Manager"**
5. Save

### Step 5: Create a Root Folder in the Shared Drive

1. Inside the Shared Drive, create a folder (e.g. "Events")
2. Copy the folder ID from the URL
3. Add it to `.env`

### Step 6: Configure `.env`

```env
GOOGLE_DRIVE_AUTH_MODE=service_account
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_shared_drive_folder_id
```

That's it — no Client ID, Secret, or refresh token needed.

### Step 7: Restart Backend

```bash
npm run dev
```

### ✅ Done! Your complete `.env` should have:

```env
GOOGLE_DRIVE_AUTH_MODE=service_account
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_shared_drive_folder_id
```

And your `credentials.json` file should be in `/backend/`.

### FAQ — Service Account Mode

**Q: I get "Service Accounts do not have storage quota" error.**
Your root folder is NOT in a Shared Drive. Either move it to a Shared Drive or switch to OAuth mode.

**Q: I get a permission error when creating files.**
Make sure the service account email is added as a member of the Shared Drive with "Content Manager" or "Manager" role.

**Q: Can I use a regular folder shared with the service account?**
No. Only Shared Drives work with service accounts for uploads. Regular shared folders still count against the uploader's (service account's) quota, which is 0.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Service Accounts do not have storage quota` | Using service account with personal Drive | Switch to `oauth` mode or use Shared Drive |
| `Access blocked: app not verified` | Your email is not a test user | Add email in OAuth consent screen → Test Users |
| `credentials.json not found` | Missing service account key | Download key from Cloud Console → place in `/backend/` |
| `Missing GOOGLE_CLIENT_ID` | OAuth env vars not set | Follow OAuth setup steps above |
| `invalid_grant` refresh token | Token was revoked | Re-run `node setup-drive-oauth.js` |
| `403 Forbidden` on file operations | No permission | OAuth: re-authorize. SA: check Shared Drive membership. |

---

## File Overview

| File | Purpose |
|---|---|
| `services/driveService.js` | Drive client — auto-selects OAuth or Service Account |
| `setup-drive-oauth.js` | One-time script to generate refresh token (OAuth only) |
| `credentials.json` | Service Account key file (SA mode only, git-ignored) |
| `.env` | All configuration variables |
