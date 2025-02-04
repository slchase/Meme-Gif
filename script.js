document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const getMemesButton = document.getElementById('get-memes');
    const memeGallery = document.getElementById('meme-gallery');
    const previewButton = document.getElementById('preview-meme');
    const downloadButton = document.getElementById('download-meme');
    const selectedMemeContainer = document.getElementById('selected-meme-container');
    const selectedMemeDisplay = document.getElementById('selected-meme-display');
    const previewContainer = document.getElementById('preview-container');
    const previewDisplay = document.getElementById('preview-display');
    const selectionText = document.getElementById('selection-text');
    const startOver1Button = document.getElementById('start-over-1');
    const startOver2Button = document.getElementById('start-over-2');
    const memeTextInput = document.getElementById('meme-text');
    const textError = document.getElementById('text-error');
    let selectedMemeUrl = '';
    let previewMemeBlob = null;

    const fontSizes = {
        small: '20px',
        medium: '30px',
        large: '40px'
    };

    function resetTool() {
        selectedMemeUrl = '';
        previewMemeBlob = null;
        memeGallery.innerHTML = '';
        selectedMemeContainer.style.display = 'none';
        previewContainer.style.display = 'none';
        selectionText.style.display = 'none';
        memeTextInput.value = '';
        textError.style.display = 'none';
        document.getElementById('font-size').value = 'medium';
        document.getElementById('text-position').value = 'top';
        getMemesButton.style.display = 'block';
    }

    async function fetchTrumpMemes() {
        const apiKey = 'VNlj7YBvdmY8SoGZKt6OBex2XDUUDkJk';
        const maxOffset = 100;
        const randomOffset = Math.floor(Math.random() * maxOffset);
        
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=trump&limit=6&offset=${randomOffset}`);
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
        
        memeGallery.innerHTML = '';
        selectionText.style.display = 'none';
        getMemesButton.style.display = 'none';
    }

    function getTextPosition(canvas, position) {
        const textY = {
            top: 40,
            middle: canvas.height / 2,
            bottom: canvas.height - 40
        };

        const textX = {
            left: canvas.width / 4,
            right: (canvas.width / 4) * 3,
            top: canvas.width / 2,
            middle: canvas.width / 2,
            bottom: canvas.width / 2
        };

        return { x: textX[position], y: textY[position] };
    }

    async function createMemeWithText(gifUrl, text, fontSize, position) {
        const canvas = document.getElementById('meme-canvas');
        const ctx = canvas.getContext('2d');
        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: 'gif.worker.js'
        });

        try {
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
                        canvas.width = gifImg.get_canvas().width;
                        canvas.height = gifImg.get_canvas().height;

                        for (let i = 0; i < numFrames; i++) {
                            gifImg.move_to(i);
                            ctx.drawImage(gifImg.get_canvas(), 0, 0);
                            
                            if (text) {
                                ctx.fillStyle = 'white';
                                ctx.strokeStyle = 'black';
                                ctx.lineWidth = 3;
                                ctx.font = `${fontSizes[fontSize]} Impact`;
                                ctx.textAlign = 'center';
                                
                                const { x, y } = getTextPosition(canvas, position);
                                ctx.strokeText(text, x, y);
                                ctx.fillText(text, x, y);
                            }

                            gif.addFrame(canvas, { 
                                copy: true, 
                                delay: 100 
                            });
                        }

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
        
        const text = memeTextInput.value.trim();
        if (!text) {
            alert('Please add some text to preview!');
            return;
        }

        if (text.length > 25) {
            textError.style.display = 'block';
            return;
        }

        try {
            previewButton.disabled = true;
            previewButton.textContent = 'Creating Preview...';
            
            const fontSize = document.getElementById('font-size').value;
            const position = document.getElementById('text-position').value;
            
            previewMemeBlob = await createMemeWithText(selectedMemeUrl, text, fontSize, position);
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

    // Share functionality
    function shareOnTwitter() {
        if (!previewMemeBlob) {
            alert('Please preview your meme first!');
            return;
        }

        const text = encodeURIComponent('Check out this Trump meme I made! 😂');
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(shareUrl, '_blank');
    }

    // Event Listeners
    getMemesButton.addEventListener('click', async () => {
        const memeUrls = await fetchTrumpMemes();
        displayMemeOptions(memeUrls);
    });

    startOver1Button.addEventListener('click', resetTool);
    startOver2Button.addEventListener('click', resetTool);
    
    previewButton.addEventListener('click', previewMeme);
    downloadButton.addEventListener('click', downloadMeme);
    document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);

    // Input validation
    memeTextInput.addEventListener('input', (e) => {
        if (e.target.value.length > 25) {
            textError.style.display = 'block';
        } else {
            textError.style.display = 'none';
        }
    });
});