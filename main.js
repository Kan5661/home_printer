// main.js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('button');
    
    button.addEventListener('click', () => {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Create FormData and append file
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                // Send file to server
                const response = await fetch('/print', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    alert('File sent to printer successfully!');
                } else {
                    alert('Error printing file');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error uploading file');
            }
        });
        
        fileInput.click();
    });
});