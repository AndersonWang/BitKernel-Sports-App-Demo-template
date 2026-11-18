#!/bin/sh
# Makes the Safari/iPhone copy of a transparent WebM avatar: an H.264 MP4 twice the height, picture on top,
# cut-out mask below (white = solid). Played by src/components/alphaVideo.jsx.
#   sh scripts/stack-alpha.sh public/assets/themes/<theme>/myspace/avatar-player.webm
in="$1"; out="${in%.webm}-alpha.mp4"
ffmpeg -v error -y -c:v libvpx-vp9 -i "$in" -filter_complex "[0:v]format=rgba,split[a][b];[a]format=rgb24[c];[b]alphaextract,format=rgb24[d];[c][d]vstack" \
  -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -an -movflags +faststart "$out" && echo "$out"
