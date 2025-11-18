#!/bin/bash

echo "🧹 Cleaning up old processes..."
killall -9 node 2>/dev/null
sleep 2

echo "🗑️  Clearing caches..."
cd /Users/laurenjohnston/Documents/Bubbles-/mobile
rm -rf .expo
rm -rf node_modules/.cache

echo "🚀 Starting Expo server..."
npx expo start --clear --web &
EXPO_PID=$!

echo "⏳ Waiting for bundle to complete..."
sleep 20

echo "🌐 Opening browser in incognito mode..."
open -na "Google Chrome" --args --incognito "http://localhost:19006"

echo "✅ Done! Server running with fresh cache. Press Ctrl+C to stop."
wait $EXPO_PID
