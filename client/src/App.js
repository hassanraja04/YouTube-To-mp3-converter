import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// backend link: https://youtube-to-mp3-converter-backend.onrender.com

function App() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState('');
  const [isConverted, setIsConverted] = useState(false);

  // Function to handle conversion
  const handleConvert = async () => {
    if (!link) return alert('Please enter a YouTube link');
    setLoading(true);
    try {
      const response = await axios.post('https://youtube-to-mp3-converter-backend.onrender.com/convert', { link });
      setTitle(response.data.title);
      setFilePath(response.data.path);
      setTimeout(() => {
        setLoading(false);
        setIsConverted(true); // Set to true to show the converted view
      }, 1000); // Adjust the timeout as needed
    } catch (error) {
      console.error(error);
      alert('Error converting the video.');
      setLoading(false);
    }
  };

  // Function to handle download
  const handleDownload = () => {
    const filename = title.trim() || 'audio';
    axios({
      url: 'https://youtube-to-mp3-converter-backend.onrender.com/download',
      method: 'GET',
      params: {
        path: filePath,
        filename: `${filename}.mp3`
      },
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }).catch((error) => {
      console.error('Error downloading the file:', error);
      alert('Error downloading the file.');
    });
  };

  // Function to reset the form for the next conversion
  const handleConvertNext = () => {
    // Request the server to delete the temporary file
  axios.post('https://youtube-to-mp3-converter-backend.onrender.com/clear')
  .then(() => {
    setLink('');  // Clear YouTube link
    setTitle(''); // Clear title
    setFilePath(''); // Clear file path
    setIsConverted(false); // Go back to initial state
  })
  .catch((error) => {
    console.error('Error clearing the file:', error);
  });
  };

  useEffect(() => {
    // Dynamically update the year in the footer
    document.getElementById('year').textContent = new Date().getFullYear();
  }, []);

  return (
    <div className='container'>
      <div className='test'>
        <div className='title'>
          <h2>YouTube to MP3 Converter</h2>
        </div>

        <div className='content'>
          {!isConverted ? (
            <div className='wrapper'>
              <div className='input-wrapper'>
                <input
                  type="text"
                  placeholder="Please paste the YouTube video URL here"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <div className='button-wrapper'>
                <button onClick={handleConvert} disabled={loading || !link}>
                Convert
                  <svg
                    className={`icon ${loading ? 'rotate-icon' : ''}`} // Apply class conditionally
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="AutorenewOutlinedIcon"
                  >
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26"></path>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className='converted-view'>
              <div className='input-container'>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className='secondbtnwrapper'>
                <div className='mp3btn'>
                  <button onClick={handleDownload}>
                    Download MP3
                    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadIcon"><path d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z"></path></svg>
                    <path d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z"></path>
                  </button>
                </div>
                <div className='convertbtn'>
                  <button onClick={handleConvertNext}>
                    Convert Next
                    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AutorenewOutlinedIcon"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26"></path></svg>
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26"></path>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className='works'>
          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Paste the Link:</strong> Copy the YouTube video URL you want to convert and paste it into the input box above
            </li>
            <li>
              <strong>Convert:</strong> Click on the "Convert" button to start the conversion process. The tool will process the video and extract the audio.
            </li>
            <li>
              <strong>Download:</strong> Once the conversion is complete, download the high-quality MP3 file to your device.
            </li>
            <li>
              <strong>Change The Title (Optional): </strong> Before downloading, you can customize the file name by clicking on the video title and editing it as desired. The updated title will be saved as the name of the MP3 file. 
            </li>
          </ol>
        </div>
        <div className='about'>
          <h2>About This Converter</h2>
          <p>
            Hi there! I’m excited to share with you the YouTube to MP3 converter that I built to make it super easy for anyone to extract high-quality audio from their favorite YouTube videos. Whether it’s music, podcasts, or any audio content you want to listen to offline, this tool has got you covered.
            <br/><br/>
            <strong>Why I Built This Tool:</strong> I wanted to create a solution that is straightforward, fast, and doesn’t require users to jump through hoops. No annoying ads, no sign-ups, just a simple and effective way to convert YouTube videos to MP3 files. I believe that accessing audio content should be hassle-free, and that’s exactly what I aimed for with this converter
          </p>
        </div>
        <div className="special">
          <h2>What Makes This Converter Special</h2>
          <div className="cards-container">
            <div className="card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M0 256L28.5 28c2-16 15.6-28 31.8-28H228.9c15 0 27.1 12.1 27.1 27.1c0 3.2-.6 6.5-1.7 9.5L208 160H347.3c20.2 0 36.7 16.4 36.7 36.7c0 7.4-2.2 14.6-6.4 20.7l-192.2 281c-5.9 8.6-15.6 13.7-25.9 13.7h-2.9c-15.7 0-28.5-12.8-28.5-28.5c0-2.3 .3-4.6 .9-6.9L176 288H32c-17.7 0-32-14.3-32-32z"/></svg>
              <h3>Speed and Reliability</h3>
              <p>
                I’ve focused on optimizing the conversion process so that you can download your MP3 files quickly and without any hiccups.
              </p>
            </div>
            <div className="card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
              <h3>Quality First</h3>
              <p>
                I understand how important audio quality is, so I made sure that this tool provides high-quality sound with every conversion.
              </p>
            </div>
            <div className="card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
              <h3>User-Centric Design</h3>
              <p>
                I kept the interface simple and user-friendly, so you can focus on getting your audio without any distractions or complications.
              </p>
            </div>
            <div className="card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M0 241.1C0 161 65 96 145.1 96c38.5 0 75.4 15.3 102.6 42.5L320 210.7l72.2-72.2C419.5 111.3 456.4 96 494.9 96C575 96 640 161 640 241.1l0 29.7C640 351 575 416 494.9 416c-38.5 0-75.4-15.3-102.6-42.5L320 301.3l-72.2 72.2C220.5 400.7 183.6 416 145.1 416C65 416 0 351 0 270.9l0-29.7zM274.7 256l-72.2-72.2c-15.2-15.2-35.9-23.8-57.4-23.8C100.3 160 64 196.3 64 241.1l0 29.7c0 44.8 36.3 81.1 81.1 81.1c21.5 0 42.2-8.5 57.4-23.8L274.7 256zm90.5 0l72.2 72.2c15.2 15.2 35.9 23.8 57.4 23.8c44.8 0 81.1-36.3 81.1-81.1l0-29.7c0-44.8-36.3-81.1-81.1-81.1c-21.5 0-42.2 8.5-57.4 23.8L365.3 256z"/></svg>
              <h3>Unlimited Conversions</h3>
              <p>
                Feel free to convert as many videos as you want. There are no limits or restrictions here!
              </p>
            </div>
          </div>
        </div>
        <div className='footer'>
          <div className='footer-left'>
            <p>Made by Hassan Raja © <span id="year"></span></p>
          </div>
          <div className='footer-right'>
            <a href="mailto:hassanrajam123@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z"/></svg>
            </a>
            <a href='https://github.com/hassanraja04?tab=overview&from=2024-09-01&to=2024-09-26' target="_blank" rel="noopener noreferrer" aria-label="Github">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/hassan-raja-24b503259/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>
            </a>
            <a href="https://www.instagram.com/hassan.raja_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App; 