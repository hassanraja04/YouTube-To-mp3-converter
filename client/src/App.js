// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [link, setLink] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [title, setTitle] = useState('');
//   const [filePath, setFilePath] = useState('');

//   // Function to handle conversion
//   const handleConvert = async () => {
//     if (!link) return alert('Please enter a YouTube link');
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:3001/convert', { link });
//       setTitle(response.data.title);
//       setFilePath(response.data.path);
//       setTimeout(() => {
//         setLoading(false);
//         // Display the second container on top
//         document.querySelector('.second-container').classList.add('visible');
//       }, 1000); // Adjust the timeout as needed
//     } catch (error) {
//       console.error(error);
//       alert('Error converting the video.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to handle download
//   const handleDownload = () => {
//     const filename = title.trim() || 'audio';
//     axios({
//       url: 'http://localhost:3001/download',
//       method: 'GET',
//       params: {
//         path: filePath,
//         filename: `${filename}.mp3`
//       },
//       responseType: 'blob'
//     }).then((response) => {
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = `${filename}.mp3`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//     }).catch((error) => {
//       console.error('Error downloading the file:', error);
//       alert('Error downloading the file.');
//     });
//   };

//   // Function to reset the form for the next conversion
//   const handleConvertNext = () => {
//     setLink('');  // Clear YouTube link
//     setTitle(''); // Clear title
//     setFilePath(''); // Clear file path
//   };

//   return (
//     <div className='container'>
//       <div className='title'>
//         <h2>YouTube to MP3 Converter</h2>
//       </div>
//       <div className='wrapper'>
//         <div className='input-wrapper'>
//           <input
//             type="text"
//             placeholder="Please paste the YouTube video URL here"
//             onChange={(e) => setLink(e.target.value)}
//           />
//         </div>
//         <div className='button-wrapper'>
//           <button onClick={handleConvert} disabled={loading}>
//             {loading ? 'Converting...' : 'Convert'}
//           </button>
//         </div>
//       </div>
      
//       {filePath && (
//         <div className='second-container'>
//           <div className='input-container'>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </div>
//           <div className='secondbtnwrapper'>
//             <div className='mp3btn'>
//               <button onClick={handleDownload}>Download MP3</button>
//             </div>
//             <div className='convertbtn'>
//               <button onClick={handleConvertNext}>
//                 Convert Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

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
      const response = await axios.post('http://localhost:3001/convert', { link });
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
      url: 'http://localhost:3001/download',
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
  axios.post('http://localhost:3001/clear')
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

  return (
    <div className='container'>
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
    </div>
  );
}

export default App;



