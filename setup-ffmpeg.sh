VIDSOURCE="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov"
VIDEO_OPTS="-s 400x250 -c:v libx264 -b:v 800000"
OUTPUT_HLS="-hls_time 5 -hls_list_size 5 -start_number 1"
ffmpeg -loglevel 32 -i "$VIDSOURCE" -rtsp_transport TCP -y $VIDEO_OPTS $OUTPUT_HLS ./video/playlist.m3u8
