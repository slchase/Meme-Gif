document.addEventListener('DOMContentLoaded', () => {
    const getMemesButton = document.getElementById('get-memes');
    const memeGallery = document.getElementById('meme-gallery');
    const downloadButton = document.getElementById('download-meme');
    const selectedMemeContainer = document.getElementById('selected-meme-container');
    const selectedMemeDisplay = document.getElementById('selected-meme-display');
    const selectionText = document.getElementById('selection-text');
    let selectedMemeUrl = '';

    async function fetchTrumpMemes() {
        const apiKey = 'VNlj7YBvdmY8SoGZKt6OBex2XDUUDkJk';
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=trump&limit=6`);
            if (!response.ok) throw new Error('Failed to fetch memes');
            const data = await response.json();
            return data.data.map(meme => meme.images.original.url);
        } catch (error) {
            console.error('Error fetching memes:', error);
            alert('Failed to fetch memes. Please try again later.');
            return [];
        }
    }

    function displayMemeOptions(memeUrls) {
        memeGallery.innerHTML = '';
        selectionText.style.display = 'block'; // Show selection text after button click
        
        memeUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.classList.add('meme-option');
            img.onclick = () => selectMeme(url, img);
            memeGallery.appendChild(img);
        });
    }

    function selectMeme(url, selectedImg) {
        // Remove selected class from all images
        document.querySelectorAll('.meme-option').forEach(img => {
            img.classList.remove('selected-meme');
        });
        
        // Add selected class to clicked image
        selectedImg.classList.add('selected-meme');
        
        // Update selected meme display
        selectedMemeUrl = url;
        selectedMemeDisplay.src = url;
        selectedMemeContainer.style.display = 'block';
    }

    async function downloadMeme() {
        if (!selectedMemeUrl) {
            alert('Please select a meme first!');
            return;
        }
        try {
            const response = await fetch(selectedMemeUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'trump_meme.gif';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading meme:', error);
            alert('Failed to download meme. Please try again.');
        }
    }

    getMemesButton.addEventListener('click', async () => {
        const memeUrls = await fetchTrumpMemes();
        displayMemeOptions(memeUrls);
        selectedMemeContainer.style.display = 'none'; // Hide selected meme when loading new ones
    });

    downloadButton.addEventListener('click', downloadMeme);
});