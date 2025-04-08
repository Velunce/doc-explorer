#!/bin/bash

# Create 'uploads' folder under 'public'
mkdir -p public/uploads

# Create or overwrite '.env.local' with the specified content
echo 'DOC_ROOT_FOLDER="public/uploads"' > .env.local

echo "Setup completed: 'uploads' folder created and '.env.local' file configured."
