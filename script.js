document.addEventListener('DOMContentLoaded', () => {
    const getGifsButton = document.getElementById('get-gifs');
    const gifGallery = document.getElementById('gif-gallery');
    const downloadButton = document.getElementById('download-gif');
    let selectedGifUrl = '';

    async function fetchTrumpGifs() {
        const apiKey = 'VNlj7YBvdmY8SoGZKt6OBex2XDUUDkJk';
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=trump&limit=6`);
            if (!response.ok) throw new Error('Failed to fetch GIFs');
            const data = await response.json();
            return data.data.map(gif => gif.images.original.url);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
            alert('Failed to fetch GIFs. Please try again later.');
            return [];
        }
    }

    function displayGifOptions(gifUrls) {
        gifGallery.innerHTML = '';
        gifUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.classList.add('gif-option');
            img.onclick = () => selectGif(url);
            gifGallery.appendChild(img);
        });
    }

    function selectGif(url) {
        selectedGifUrl = url;
        downloadButton.style.display = 'block';
    }

    async function downloadGif() {
        if (!selectedGifUrl) {
            alert('Please select a GIF first!');
            return;
        }
        try {
            const response = await fetch(selectedGifUrl);
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
            console.error('Error downloading GIF:', error);
            alert('Failed to download GIF. Please try again.');
        }
    }

    getGifsButton.addEventListener('click', async () => {
        const gifUrls = await fetchTrumpGifs();
        displayGifOptions(gifUrls);
    });

    downloadButton.addEventListener('click', downloadGif);
});
