# Development Guide

This document outlines all the necessary steps to create, develop, and build your Electron app using Vite and React. It covers project setup, file configuration for Electron integration (including a splash screen), and packaging the app (Linux-only build).

---

## 1. Creating the Project

### 1.1 Scaffold a Vite + React Project

Open your terminal and run:

```bash
# Create a new Vite project named "aiagent"
npm create vite@latest aiagent --template react

# Navigate into the project directory
cd aiagent

# Install project dependencies
npm install
```

### 1.2 Install Electron and Helper Packages

Install Electron as a development dependency, along with optional utilities for environment variables and running processes concurrently:

```bash
npm install electron electron-builder --save-dev
npm install cross-env concurrently npm-run-all --save-dev
```

---

## 2. File Updates for Using Electron

### 2.1 Create the Electron Main Process File

In the project root, create a file called `electron.js`

```javascript
import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let splash, mainWindow;

function createWindow() {
    // Create the splash screen window
    splash = new BrowserWindow({
        width: 400,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
    });

    // Inline splash content using a data URL
    const splashHTML = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>AiAgent</title>
            </head>
            <body>
            </body>
        </html>
    `;
    splash.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(splashHTML)}`);

    // Create the main window (hidden until ready)
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the appropriate URL/file depending on environment
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // When the main window is ready, destroy the splash and show the main window
    mainWindow.once('ready-to-show', () => {
        splash.destroy();
        mainWindow.show();
    });
}

app.disableHardwareAcceleration();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

> **Tip:** If you prefer to keep the splash screen in a separate file (e.g., `splash.html`), you can synchronously read the file on startup using Node’s `fs` module and then load it via a data URL. Remember to include `splash.html` in your packaged files.

### 2.2 Update `package.json`

1. **Set the Main Entry:**

Ensure your `package.json` has the `"main"` field pointing to `electron.js`:

```json
{
    "name": "aiagent",
    "private": true,
    "version": "0.0.0",
    // ... other fields
}
```

2. **Add Scripts for Development and Building:**

Update the `"scripts"` section to run Vite and Electron concurrently, build the project, and package the app for Linux:

```json
"scripts": {
        "dev": "concurrently \"npm:dev:vite\" \"npm:dev:electron\"",
        "dev:vite": "vite",
        "dev:electron": "cross-env NODE_ENV=development electron .",
        "prod": "npm-run-all -s prod:vite prod:electron",
        "prod:vite": "vite build",
        "prod:electron": "electron .",
        "build": "npm-run-all -s build:vite build:electron",
        "build:vite": "vite build",
        "build:electron": "npm run build:electron:linux",
        "build:electron:linux": "electron-builder --linux",
    // ... other fields
}
```

###  2.3 Update Vite Configuration

To ensure assets are referenced correctly when loaded from the filesystem (especially important in production), update your `vite.config.js` with a relative **base**:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Ensures assets are referenced relative to index.html
  plugins: [react()],
});
```

## 3. Running and Debugging in Development

### 3.1 Start the Development Environment

Run the following command:

```bash
npm run dev
```

This command does the following:
- **Vite Dev Server:** Starts at [http://localhost:5173](http://localhost:5173) (or the port specified by Vite).
- **Electron:** Launches with the splash screen immediately visible. The main window loads in the background and is shown once ready.

### 3.2 Debugging

- **Main Process:**
  Use VSCode’s debugger or terminal logs to inspect issues from `electron.js`.

- **Renderer Process:**
  Open the Electron window’s DevTools (`Ctrl+Shift+I` on Windows/Linux or `Cmd+Option+I` on macOS) to debug the React app. Vite provides source maps by default.

---

## 4. Building for Production

### 4.1 Test the Production Version

Run the production version locally to ensure it loads correctly:

```bash
npm run prod
```

### 4.2 Packaging for Linux

This project is configured for Linux-only packaging. Update your electron-builder configuration in `package.json` if necessary:

```json
"build": {
    "publish": false,
    "appId": "mg.rivolink.aiagent",
    "files": [
        "dist/**/*",
        "electron.js"
    ],
    "directories": {
        "buildResources": "assets"
    },
    "linux": {
        "target": "AppImage",
        "category": "Utility"
    }
}
```

Then package the app by running:

```bash
npm run build
```

This command builds the app and packages it for Linux (e.g. as an AppImage).

---

## Summary

- **Project Creation:**
  Scaffold a Vite + React project and install Electron with helper packages.
- **Electron Integration:**
  Create the Electron main process file with a splash screen (inline or file-based) and update the project configuration.
- **Development:**
  Run `npm run dev` to launch both Vite and Electron, and use debugging tools for the main and renderer processes.
- **Production Build and Packaging:**
  Test production version locally with `npm run prod`, build the application with `npm run build`.
