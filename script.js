document.addEventListener('DOMContentLoaded', () => {
    const getMemesButton = document.getElementById('get-memes');
    const memeGallery = document.getElementById('meme-gallery');
    const previewButton = document.getElementById('preview-meme');
    const downloadButton = document.getElementById('download-meme');
    const selectedMemeContainer = document.getElementById('selected-meme-container');
    const selectedMemeDisplay = document.getElementById('selected-meme-display');
    const previewContainer = document.getElementById('preview-container');
    const previewDisplay = document.getElementById('preview-display');
    const selectionText = document.getElementById('selection-text');
    let selectedMemeUrl = '';
    let previewMemeBlob = null;

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
        selectionText.style.display = 'block';
        
        memeUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.classList.add('meme-option');
            img.onclick = () => selectMeme(url, img);
            memeGallery.appendChild(img);
        });
    }

    function selectMeme(url, selectedImg) {
        document.querySelectorAll('.meme-option').forEach(img => {
            img.classList.remove('selected-meme');
        });
        
        selectedImg.classList.add('selected-meme');
        selectedMemeUrl = url;
        selectedMemeDisplay.src = url;
        selectedMemeContainer.style.display = 'flex';
        previewContainer.style.display = 'none';
    }

    async function createMemeWithText(gifUrl, text) {
        const canvas = document.getElementById('meme-canvas');
        const ctx = canvas.getContext('2d');
        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: 'gif.worker.js'
        });

        try {
            // Create a SuperGif instance
            const img = document.createElement('img');
            img.src = gifUrl;
            
            return new Promise((resolve, reject) => {
                const gifImg = new SuperGif({ 
                    gif: img,
                    auto_play: false 
                });
                
                gifImg.load(() => {
                    try {
                        const numFrames = gifImg.get_length();
                        console.log(`Processing ${numFrames} frames`);
                        
                        // Set canvas dimensions
                        canvas.width = gifImg.get_canvas().width;
                        canvas.height = gifImg.get_canvas().height;

                        // Process each frame
                        for (let i = 0; i < numFrames; i++) {
                            gifImg.move_to(i);
                            
                            // Draw the current frame
                            ctx.drawImage(gifImg.get_canvas(), 0, 0);
                            
                            // Add text
                            if (text) {
                                ctx.fillStyle = 'white';
                                ctx.strokeStyle = 'black';
                                ctx.lineWidth = 3;
                                ctx.font = '30px Impact';
                                ctx.textAlign = 'center';
                                
                                // Position text at top
                                ctx.strokeText(text, canvas.width / 2, 40);
                                ctx.fillText(text, canvas.width / 2, 40);
                            }

                            // Add frame to new GIF
                            gif.addFrame(canvas, { 
                                copy: true, 
                                delay: 100 
                            });
                        }

                        // Render the final GIF
                        gif.on('finished', (blob) => {
                            resolve(blob);
                        });
                        gif.render();
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('Error creating meme:', error);
            throw error;
        }
    }

    async function previewMeme() {
        if (!selectedMemeUrl) {
            alert('Please select a meme first!');
            return;
        }
        
        const text = document.getElementById('meme-text').value;
        if (!text.trim()) {
            alert('Please add some text to preview!');
            return;
        }

        try {
            previewButton.disabled = true;
            previewButton.textContent = 'Creating Preview...';
            
            previewMemeBlob = await createMemeWithText(selectedMemeUrl, text);
            const url = URL.createObjectURL(previewMemeBlob);
            previewDisplay.src = url;
            previewContainer.style.display = 'flex';
            
            previewButton.disabled = false;
            previewButton.textContent = 'Preview Meme';
        } catch (error) {
            console.error('Error creating preview:', error);
            alert('Failed to create preview. Please try again.');
            previewButton.disabled = false;
            previewButton.textContent = 'Preview Meme';
        }
    }

    async function downloadMeme() {
        if (!previewMemeBlob) {
            alert('Please preview the meme first!');
            return;
        }
        
        try {
            const url = URL.createObjectURL(previewMemeBlob);
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
        selectedMemeContainer.style.display = 'none';
        previewContainer.style.display = 'none';
    });

    previewButton.addEventListener('click', previewMeme);
    downloadButton.addEventListener('click', downloadMeme);
});