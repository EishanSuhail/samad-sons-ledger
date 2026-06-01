# Step-by-Step Deployment Guide: Samad & Sons Ledger

This guide explains how to deploy your Android App and set up your premium landing page completely for free. 

---

## Prerequisites
1. **GitHub Account**: A free account on [github.com](https://github.com).
2. **Git Installed**: Ensure Git is installed on your computer.

---

## Step 1: Initialize Git and Commit Your Code
Because we created a `.gitignore` file, heavy files like `node_modules/` and your local `jdk21/` folder will be ignored. Your repository will remain super fast and lightweight!

Open your terminal or command prompt in this project folder (`c:\Users\eishan suhail\Anti-gravity`) and run these commands:

```bash
# 1. Initialize git repository
git init

# 2. Add all files to staging (large files will be automatically ignored)
git add .

# 3. Commit your files
git commit -m "feat: add application source and premium landing page"
```

---

## Step 2: Create a Repository on GitHub and Push
1. Open your web browser and go to [github.com/new](https://github.com/new).
2. Set the **Repository name** to `samad-sons-ledger`.
3. Choose **Public** (required to use free GitHub Pages).
4. Do **NOT** check any boxes for "Add a README", ".gitignore", or "license" (we already have these).
5. Click **Create repository**.
6. Run the following commands in your terminal to link and push your code:

```bash
# Rename default branch to main
git branch -M main

# Link your local project to GitHub (Replace 'YOUR_GITHUB_USERNAME' with your actual username)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/samad-sons-ledger.git

# Push the code to GitHub
git push -u origin main
```

---

## Step 3: Create a GitHub Release and Host your APK
To distribute your app, we will host the `.apk` binary on GitHub's globally fast content delivery network (CDN).

1. Go to your repository page: `https://github.com/YOUR_GITHUB_USERNAME/samad-sons-ledger`.
2. On the right side, click **Create a new release** (or **Releases** -> **Draft a new release**).
3. In **Choose a tag**, type `v1.0.0` and click **Create new tag**.
4. Set the **Release title** to `v1.0.0 - Production Release`.
5. Under the description text box, there is a file uploader box: *"Attach binaries by sliding or selecting them"*.
6. Drag and drop your **`Samad_Sons_Ledger_Final.apk`** file here.
7. Click **Publish release**.

---

## Step 4: Update the Download Link in `landing.html`
Now that your APK is uploaded, let's link the "Download APK" button on your landing page directly to it.

1. In your published release, right-click on the **`Samad_Sons_Ledger_Final.apk`** download link under "Assets" and click **Copy Link Address**.
   - It will look like this: `https://github.com/YOUR_GITHUB_USERNAME/samad-sons-ledger/releases/download/v1.0.0/Samad_Sons_Ledger_Final.apk`
2. Open `landing.html` in your editor.
3. Locate line `197` where you see:
   ```html
   <a href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/releases/latest/download/Samad_Sons_Ledger_Final.apk" id="apk-download-btn" ...>
   ```
4. Replace that placeholder link with your copied link address.
5. Save the file, commit the change, and push it to GitHub:
   ```bash
   git add landing.html
   git commit -m "docs: update direct APK download link"
   git push
   ```

---

## Step 5: Enable your Premium Landing Page (GitHub Pages)
Now, let's make your stunning landing page public for everyone to visit!

1. In your GitHub repository, click on the **Settings** tab (gear icon at the top).
2. In the left sidebar, scroll down to the **Code and automation** section and click **Pages**.
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Click the dropdown, select `main`, and keep the folder as `/ (root)`.
4. Click **Save**.
5. Wait about 1-2 minutes. Refresh the page, and you will see a banner at the top saying:
   *Your site is live at: `https://YOUR_GITHUB_USERNAME.github.io/samad-sons-ledger/`*
6. Since we named the file `landing.html`, your download page will be live at:
   `https://YOUR_GITHUB_USERNAME.github.io/samad-sons-ledger/landing.html`

🎉 **Congratulations!** Your Android app is now hosted and deployed completely for free. Your users can visit your premium download page and sideload the APK safely!
