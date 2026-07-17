# GlobalCue | Smart Timezone Reminders

GlobalCue is a Next.js 15 application designed to help global teams synchronize their meetings with AI-driven insights and timezone conflict optimization.

## 🛠 Troubleshooting: "Unauthorized Domain" Error
If you see `auth/unauthorized-domain` during Sign-In:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Authentication** > **Settings** > **Authorized domains**.
4. Click **Add domain**.
5. Copy your current app domain from the browser address bar (e.g., `studio-7572923431.workstations.google.com` or your preview URL) and add it to the list.
6. Refresh your app and try again.

## 🚀 How to Put This on Your GitHub

Follow these steps to add this project to your GitHub profile:

1.  **Download the Code**: Click the **Download** icon in the top toolbar of Firebase Studio.
2.  **Extract the Files**: Unzip the folder on your computer.
3.  **Create a New Repository**: Go to [GitHub.com/new](https://github.com/new) and create a repository named `globalcue`.
4.  **Open Your Terminal**: Navigate into your extracted project folder.
5.  **Run These Commands**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: GlobalCue Smart Scheduler"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/globalcue.git
    git push -u origin main
    ```

## 🌟 Resume Highlights

- **AI-Agent Engineering**: Leveraged **Google Genkit** to build agentic flows that summarize meeting context and calculate optimal meeting windows based on participant working hours.
- **Complex Timezone Logic**: Solved intricate scheduling challenges handling conversions across diverse global hubs (e.g., IST, EST, JST).
- **Cloud Infrastructure**: Integrated **Firebase Authentication** for secure sessions and **Firestore** for real-time data synchronization.
- **Modern Tech Stack**: Built with **Next.js 15 (App Router)**, **React 19**, and **TypeScript**.

## Tech Stack
- **Framework**: Next.js 15
- **Backend**: Firebase (Auth & Firestore)
- **AI**: Google Genkit (Gemini 2.5 Flash)
- **Styling**: Tailwind CSS + ShadCN UI
