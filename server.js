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
            // Skip over non-IPv4 and internal (loopback) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const printFilesDir = path.join(__dirname, 'print-files');
        // Create directory if it doesn't exist
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

// Handle file upload and printing
app.post('/print', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;
    
    // Print the file using lp command
    exec(`lp "${filePath}"`, (error, stdout, stderr) => {
        // Delete the file after printing
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