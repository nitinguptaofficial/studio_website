Step-by-Step: Get Google Drive API Credentials
IMPORTANT

You need a Google Cloud Service Account. This is a robot account that your backend uses to read and write to Google Drive on behalf of the studio. You do NOT need to log in as yourself every time.

Step 1 — Create a Google Cloud Project
Go to console.cloud.google.com.
Click the project dropdown (top-left, next to the Google Cloud logo).
Click "New Project".
Name it VermaStudios (or anything you like) and click Create.
Make sure this new project is selected in the dropdown before continuing.

Step 2 — Enable the Google Drive API
In the left sidebar, click "APIs & Services" → "Library".
Search for "Google Drive API".
Click on the result and press the blue "Enable" button.

Step 3 — Create a Service Account
In the left sidebar, click "APIs & Services" → "Credentials".
Click "+ Create Credentials" at the top → choose "Service Account".
Fill in:
Service account name: vermastudios-backend
Service account ID: (auto-filled, keep it)
Click "Create and Continue"
On the "Grant this service account access" screen, skip (click Continue).
On the "Grant users access" screen, skip (click Done).

Step 4 — Download credentials.json
You should now see your new service account listed. Click on its email address.
Go to the "Keys" tab.
Click "Add Key" → "Create new key".
Choose JSON format and click Create.
A .json file will download. Rename it credentials.json.
Place credentials.json inside the backend/ folder:
d:\New folder\New folder\studio_website\backend\credentials.json
CAUTION

Never commit credentials.json to Git. It is already in .gitignore. Double-check this before pushing your code.

Step 5 — Create a Root Folder in Google Drive
Open drive.google.com in your browser.
Create a new folder called Verma Studios Events (or any name).
Open the folder. Look at the URL — it will look like:
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnO_XXXXXXXX
Copy the long ID at the end (the part after /folders/).
Paste it into your .env file:
GOOGLE_DRIVE_ROOT_FOLDER_ID=1AbCdEfGhIjKlMnO_XXXXXXXX

Step 6 — Share the Root Folder with the Service Account
IMPORTANT

This is the most commonly missed step! The service account needs permission to write into your Google Drive folder.

In Google Drive, right-click the Verma Studios Events folder.
Click "Share".
In the "Add people and groups" field, paste the service account's email address.
It looks like: vermastudios-backend@your-project.iam.gserviceaccount.com
Find it in Google Cloud Console → IAM & Admin → Service Accounts.
Set the role to Editor.
Click "Send" (or "Share").

Step 7 — Restart the Backend
bash
# In the backend folder, restart the dev server
npm run dev
The backend will now:

Use the service account to authenticate with Drive on startup.
Auto-create per-event subfolders inside your root folder when you upload photos.
Serve the first 30 images natively to the client gallery.
Stream a complete .zip archive of all photos directly to the user's browser.