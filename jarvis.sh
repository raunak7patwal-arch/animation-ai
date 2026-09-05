#!/data/data/com.termux/files/usr/bin/bash

cd "$HOME/animation-ai"

case "$1" in
  start)
    node jarvis/server.js
    ;;
  backup)
    curl -s -X POST http://127.0.0.1:3010/api/jarvis/backup
    echo
    ;;
  health)
    curl -s http://127.0.0.1:3010/api/jarvis/health
    echo
    ;;
  ask)
    shift
    TEXT="$*"

    curl -s -X POST http://127.0.0.1:3010/api/jarvis \
      -H "Content-Type: application/json" \
      -d "$(node -e 'console.log(JSON.stringify({command:process.argv[1]}))' "$TEXT")"

    echo
    ;;
  *)
    echo "JARVIS commands:"
    echo "  ./jarvis.sh start"
    echo "  ./jarvis.sh health"
    echo "  ./jarvis.sh ask \"your command\""
    echo "  ./jarvis.sh backup"
    ;;
esac
