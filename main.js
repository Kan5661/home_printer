// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const button = document.querySelector('#printButton');
    console.log('Button found:', button);
    
    if (!button) {
        console.error('Button not found!');
        return;
    }
    
    button.addEventListener('click', () => {
        console.log('Button clicked');
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        console.log('File input created');
        
        fileInput.addEventListener('change', async (e) => {
            console.log('File selected');
            const file = e.target.files[0];
            if (!file) {
                console.log('No file selected');
                return;
            }
            
            console.log('Selected file:', file.name);
            
            // Create FormData and append file
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                console.log('Sending file to server...');
                // Send file to server
                const response = await fetch('/print', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    console.log('Print successful');
                    alert('File sent to printer successfully!');
                } else {
                    console.error('Server error response');
                    alert('Error printing file');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error uploading file');
            }
        });
        
        console.log('Triggering file input click');
        fileInput.click();
    });
    
    console.log('Click listener added to button');
});