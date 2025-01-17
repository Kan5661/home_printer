const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

// Get printer status
function getPrinterStatus() {
    return new Promise((resolve, reject) => {
        exec('lpstat -p', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            const statusInfo = {
                isEnabled: false,
                status: '',
                lastUpdate: '',
                message: ''
            };

            // Parse the output
            const lines = stdout.split('\n');
            for (const line of lines) {
                if (line.includes('HL-L2300D-series')) {
                    // Check if printer is enabled or disabled
                    if (line.includes('disabled')) {
                        statusInfo.isEnabled = false;
                        const parts = line.split('disabled since');
                        statusInfo.status = 'disabled';
                        statusInfo.lastUpdate = parts[1]?.split('-')[0]?.trim() || '';
                        statusInfo.message = parts[1]?.split('-')[1]?.trim() || '';
                    } else {
                        statusInfo.isEnabled = true;
                        const parts = line.split('enabled since');
                        statusInfo.status = line.split('is')[1].split('.')[0].trim(); // Gets 'idle' or other status
                        statusInfo.lastUpdate = parts[1]?.trim() || '';
                    }
                    break;
                }
            }

            resolve(statusInfo);
        });
    });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const printFilesDir = path.join(__dirname, 'print-files');
        if (!fs.existsSync(printFilesDir)){
            fs.mkdirSync(printFilesDir);
        }
        cb(null, printFilesDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('./'));

// New endpoint for printer status
app.get('/status', async (req, res) => {
    try {
        const status = await getPrinterStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get printer status' });
    }
});

// Handle file upload and printing
app.post('/print', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;

    exec(`lp "${filePath}"`, (error, stdout, stderr) => {
        fs.unlink(filePath, (unlinkError) => {
            if (error || unlinkError) {
                return res.status(500).send('Error printing file');
            }
            res.send('File printed successfully');
        });
    });
});

const PORT = 3000;
const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${localIP}:${PORT}`);
});
