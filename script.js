import { parseGIF, decompressFrames } from './scripts/gifuct-js.min.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded and DOM fully ready.');

    const canvas = document.getElementById('meme-canvas');
    const ctx = canvas.getContext('2d');
    const memeTextInput = document.getElementById('meme-text');
    const fontSelect = document.getElementById('font-select');
    const colorPicker = document.getElementById('color-picker');
    const textPositionSelect = document.getElementById('text-position');
    const getGifsButton = document.getElementById('get-gifs');
    const downloadButton = document.getElementById('download-gif');

    let currentGifUrl = '';
    let gifFrames = [];
    let currentFrameIndex = 0;

    // Fetch Trump-themed GIFs from Giphy
    async function fetchTrumpGifs() {
        console.log('Fetching Trump GIFs...');
        const apiKey = 'VNlj7YBvdmY8SoGZKt6OBex2XDUUDkJk'; // Replace with your Giphy API key
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=trump&limit=6`);
            if (!response.ok) throw new Error('Failed to fetch GIFs');
            const data = await response.json();
            console.log('GIFs fetched:', data);
            return data.data.map(gif => gif.images.original.url);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
            alert('Failed to fetch GIFs. Please try again later.');            git init
            return [];
        }
    }

    // Display GIF options in the gallery
    function displayGifOptions(gifUrls) {
        console.log('Displaying GIF options...');
        const gifGallery = document.getElementById('gif-gallery');
        gifGallery.innerHTML = ''; // Clear the gallery

        gifUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.classList.add('gif-option');
            img.onclick = () => selectGif(url); // Select GIF on click
            gifGallery.appendChild(img);
        });
    }

    // Select a GIF for editing
    async function selectGif(url) {
        console.log('GIF selected:', url);
        currentGifUrl = url;
        await loadAndExtractGifFrames(url);
    }

    // Load and extract frames from the GIF
    async function loadAndExtractGifFrames(url) {
        console.log('Loading and extracting GIF frames...');
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const gif = gifuct.parseGIF(arrayBuffer); // Use the global gifuct object
            const frames = gifuct.decompressFrames(gif, true); // Use the global gifuct object

            if (!frames || frames.length === 0) {
                throw new Error('No frames found in the GIF.');
            }

            canvas.width = frames[0].dims.width;
            canvas.height = frames[0].dims.height;

            // Extract frames
            gifFrames = frames.map(frame => {
                const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
                return { imageData, delay: frame.delay };
            });

            // Start animating the preview
            animateGifPreview();
        } catch (error) {
            console.error('Error loading GIF frames:', error);
            alert('Failed to load GIF frames. Please try another GIF.');
        }
    }

    // Draw text on the canvas
    function drawText() {
        const text = memeTextInput.value.trim();
        if (!text) {
            console.log('No text to draw.');
            return;
        }

        console.log('Drawing text:', text);
        ctx.font = `40px ${fontSelect.value}`;
        ctx.fillStyle = colorPicker.value;
        ctx.textAlign = 'center';

        const position = textPositionSelect.value;
        let x, y;

        switch (position) {
            case 'top':
                x = canvas.width / 2;
                y = 50; // 50px from the top
                break;
            case 'bottom':
                x = canvas.width / 2;
                y = canvas.height - 20; // 20px from the bottom
                break;
            case 'left':
                x = 50; // 50px from the left
                y = canvas.height / 2;
                ctx.textAlign = 'left';
                break;
            case 'right':
                x = canvas.width - 50; // 50px from the right
                y = canvas.height / 2;
                ctx.textAlign = 'right';
                break;
        }

        ctx.fillText(text, x, y);
    }

    // Animate the GIF preview
    function animateGifPreview() {
        if (gifFrames.length === 0) return;

        const frame = gifFrames[currentFrameIndex];
        ctx.putImageData(frame.imageData, 0, 0);
        drawText();

        currentFrameIndex = (currentFrameIndex + 1) % gifFrames.length;
        setTimeout(animateGifPreview, frame.delay || 100); // Use the frame's delay or default to 100ms
    }

    // Download the meme as an animated GIF
    async function downloadMeme() {
        console.log('Downloading meme...');
        if (gifFrames.length === 0) {
            alert('Please select a GIF first!');
            return;
        }

        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
        });

        // Add each frame to the GIF
        gifFrames.forEach(frame => {
            ctx.putImageData(frame.imageData, 0, 0);
            drawText();
            gif.addFrame(ctx, { copy: true, delay: frame.delay || 100 });
        });

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'meme.gif';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });

        gif.render();
    }

    // Event listeners
    getGifsButton.addEventListener('click', async () => {
        console.log('Get GIFs button clicked.');
        const gifUrls = await fetchTrumpGifs();
        displayGifOptions(gifUrls);
    });

    downloadButton.addEventListener('click', () => {
        console.log('Download button clicked.');
        downloadMeme();
    });

    memeTextInput.addEventListener('input', () => {
        if (currentGifUrl) {
            console.log('Text input changed.');
            loadAndExtractGifFrames(currentGifUrl);
        }
    });

    fontSelect.addEventListener('change', () => {
        if (currentGifUrl) {
            console.log('Font changed.');
            loadAndExtractGifFrames(currentGifUrl);
        }
    });

    colorPicker.addEventListener('change', () => {
        if (currentGifUrl) {
            console.log('Color changed.');
            loadAndExtractGifFrames(currentGifUrl);
        }
    });

    textPositionSelect.addEventListener('change', () => {
        if (currentGifUrl) {
            console.log('Text position changed.');
            loadAndExtractGifFrames(currentGifUrl);
        }
    });
});