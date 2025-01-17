document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#printButton');
    const fileInput = document.querySelector('#fileInput');
    const status = document.querySelector('#status');
    const printerDetails = document.querySelector('#printerDetails');
    
    function updateStatus(message, isError = false) {
        status.textContent = message;
        status.style.color = isError ? 'red' : 'black';
        console.log(message);
    }
    
    async function updatePrinterStatus() {
        try {
            const response = await fetch('/status');
            const statusData = await response.json();
            
            let statusHtml = '';
            
            if (statusData.isRunning) {
                statusHtml += `<div>Print Service: <span style="color: #28a745">Running</span></div>`;
            } else {
                statusHtml += `<div>Print Service: <span style="color: #dc3545">Not Running</span></div>`;
            }
            
            if (statusData.defaultPrinter) {
                statusHtml += `<div>Default Printer: <span class="default-printer">${statusData.defaultPrinter}</span></div>`;
            }
            
            if (statusData.printers.length > 0) {
                statusHtml += '<div style="margin-top: 10px;">Printers:</div>';
                statusData.printers.forEach(printer => {
                    statusHtml += `
                        <div class="printer-item">
                            <span class="printer-name">${printer.name}</span>
                            <span class="printer-status">${printer.status}</span>
                        </div>
                    `;
                });
            }
            
            printerDetails.innerHTML = statusHtml;
            
            // Update again in 30 seconds
            setTimeout(updatePrinterStatus, 30000);
        } catch (error) {
            printerDetails.innerHTML = 'Error fetching printer status';
            console.error('Status error:', error);
            // Try again in 5 seconds if there was an error
            setTimeout(updatePrinterStatus, 5000);
        }
    }
    
    // Initial status update
    updatePrinterStatus();
    
    const triggerFileInput = (e) => {
        e.preventDefault();
        console.log('Triggering file input');
        fileInput.click();
    };

    button.addEventListener('touchend', triggerFileInput, false);
    button.addEventListener('click', triggerFileInput, false);
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            updateStatus('No file selected', true);
            return;
        }
        
        updateStatus(`Selected: ${file.name}`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        button.disabled = true;
        button.textContent = 'Sending...';
        
        try {
            updateStatus('Sending to printer...');
            const response = await fetch('/print', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                updateStatus('✅ File sent to printer successfully!');
                // Update printer status after successful print
                updatePrinterStatus();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error:', error);
            updateStatus('❌ Error sending to printer', true);
        } finally {
            button.disabled = false;
            button.textContent = 'Select File to Print';
            fileInput.value = '';
        }
    });
});