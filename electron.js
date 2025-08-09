import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let splash, mainWindow;

function createWindow() {
    // Create the splash screen window
    splash = new BrowserWindow({
        width: 270,
        height: 360,
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
        width: 540,
        height: 720,
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

    // Remove the menu bar
    mainWindow.setMenu(null);

    // When the main window is ready, destroy the splash and show the main window
    mainWindow.once('ready-to-show', () => {
        splash.destroy();
        mainWindow.show();
    });
}

app.setName('AiAgent');
app.disableHardwareAcceleration();
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
