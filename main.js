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

            let statusHtml = '<div class="printer-item">';
            statusHtml += '<div class="printer-name">HL-L2300D-series</div>';

            if (statusData.isEnabled) {
                statusHtml += `
                    <div class="printer-status">
                        <span class="status-badge enabled">🟢 ${statusData.status}</span>
                        <div class="status-time">Since: ${statusData.lastUpdate}</div>
                    </div>`;
            } else {
                statusHtml += `
                    <div class="printer-status">
                        <span class="status-badge disabled">🔴 ${statusData.status}</span>
                        <div class="status-time">Printer disabled/sleep</div>
                        ${statusData.message ? `<div class="status-message">${statusData.message}</div>` : ''}
                    </div>`;
            }

            statusHtml += '</div>';
            printerDetails.innerHTML = statusHtml;

            // Update button state based on printer status
            button.disabled = !statusData.isEnabled;

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
