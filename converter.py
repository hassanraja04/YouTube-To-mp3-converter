import ssl
import os
import subprocess
from pytube import YouTube

def download_video(url):
    ssl._create_default_https_context = ssl._create_unverified_context
    video = YouTube(
        url,
        use_oauth=False,
        allow_oauth_cache=True
    )
    stream = video.streams.filter(only_audio=True).first()
    output_folder = os.path.expanduser("~/Desktop/converter")
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"{video.title}.mp3")
    stream.download(output_path=output_folder)
    os.rename(os.path.join(output_folder, stream.default_filename), output_file)

def youtube_to_mp3():
    url = input("Enter YouTube video URL: ")
    try:
        download_video(url)
        print("Conversion completed successfully!")
    except Exception as e:
        print("An error occurred:", str(e))

youtube_to_mp3()
