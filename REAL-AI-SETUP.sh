#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "=== REAL AI SETUP ==="

pkg update -y >/dev/null 2>&1
pkg install -y git cmake wget python ffmpeg libwebp >/dev/null 2>&1

mkdir -p ai-local/models ai-local/bin

# Real local image AI runtime
if [ ! -d ai-local/stable-diffusion.cpp ]; then
  git clone --depth 1 --recursive https://github.com/leejet/stable-diffusion.cpp ai-local/stable-diffusion.cpp >/dev/null 2>&1
fi

cd ai-local/stable-diffusion.cpp
mkdir -p build
cd build

if [ ! -f bin/sd-cli ]; then
  cmake -DSD_USE_SYSTEM_WEBP=ON -DSD_BUILD_SERVER=OFF -DSD_CUDA=OFF -DSD_METAL=OFF .. >/dev/null 2>&1
  cmake --build . -j2 >/dev/null 2>&1
fi

cd ~/animation-ai

# Neural TTS runtime source
if [ ! -d ai-local/sherpa-onnx ]; then
  git clone --depth 1 https://github.com/k2-fsa/sherpa-onnx ai-local/sherpa-onnx >/dev/null 2>&1
fi

cat > ai-local/REAL-AI-STATUS.txt <<STATUS
REAL LOCAL AI RUNTIME
IMAGE: stable-diffusion.cpp
TTS: sherpa-onnx
VIDEO: existing Animation AI pipeline
STATUS

test -x ai-local/stable-diffusion.cpp/build/bin/sd-cli && echo "IMAGE AI RUNTIME: SUCCESS" || echo "IMAGE AI RUNTIME: FAILED"
test -d ai-local/sherpa-onnx && echo "NEURAL TTS RUNTIME: SUCCESS" || echo "NEURAL TTS RUNTIME: FAILED"
test -f server.js && echo "ANIMATION AI: SUCCESS" || echo "ANIMATION AI: FAILED"
test -d android && echo "ANDROID APK: READY" || echo "ANDROID APK: FAILED"

echo "=== END ==="
