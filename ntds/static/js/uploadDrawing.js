document.addEventListener('DOMContentLoaded', function () {
    const saveModal = document.getElementById('save-modal');
    const saveForm = document.getElementById('saveDrawingForm');
    const canvas = document.getElementById('canvas');

    document.getElementById('save').addEventListener('click', () => {
        saveModal.style.display = 'flex';
    });

    document.getElementById('cancel-save').addEventListener('click', () => {
        saveModal.style.display = 'none';
        saveForm.reset();
    });

    document.getElementById('cancel-save-btn').addEventListener('click', () => {
        saveModal.style.display = 'none';
        saveForm.reset();
    });

    saveModal.addEventListener('click', (e) => {
        if (e.target === saveModal) {
            saveModal.style.display = 'none';
            saveForm.reset();
        }
    });

    saveForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const title = document.getElementById('drawing-title').value;
        const description = document.getElementById('drawing-description').value;
        const dataURL = canvas.toDataURL('image/png');
        
        const blob = await dataURLToBlob(dataURL);

        const formData = new FormData();
        formData.append('image', blob, 'drawing.png');
        formData.append('title', title);
        formData.append('description', description);

        try {
            const response = await fetch('/draw/create/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Drawing saved successfully!');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                showToast(data.error || 'Failed to save drawing', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to save drawing', 'error');
        }

        saveModal.style.display = 'none';
        saveForm.reset();
    });

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    async function dataURLToBlob(dataURL) {
        const res = await fetch(dataURL);
        const blob = await res.blob();
        return blob;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});