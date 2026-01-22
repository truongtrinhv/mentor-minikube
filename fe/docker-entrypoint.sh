#!/bin/sh

# This script injects runtime environment variables into the built React app
# by creating a runtime-config.js file that can be loaded before the app starts

set -e

# Create runtime config file
cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.RUNTIME_CONFIG = {
  VITE_API_URL_ROOT: '${VITE_API_URL_ROOT:-http://mentorplatform-api-service:8080}'
};
EOF

echo "Runtime configuration created:"
cat /usr/share/nginx/html/runtime-config.js

# Execute the CMD
exec "$@"
