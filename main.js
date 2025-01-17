// main.js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#printButton');
    const fileInput = document.querySelector('#fileInput');
    const status = document.querySelector('#status');
    
    function updateStatus(message, isError = false) {
        status.textContent = message;
        status.style.color = isError ? 'red' : 'black';
        console.log(message);
    }
    
    button.addEventListener('click', () => {
        fileInput.click();
    });
    
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
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error:', error);
            updateStatus('❌ Error sending to printer', true);
        } finally {
            button.disabled = false;
            button.textContent = 'Select File to Print';
            // Reset file input for next selection
            fileInput.value = '';
        }
    });
    
    // Handle mobile touch events
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-tap zoom on mobile
    });
});