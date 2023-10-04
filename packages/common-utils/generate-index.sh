#!/bin/bash

# Initialize an empty string to hold the formatted export commands.
formatted_exports=""

# Loop through all *.ts, *.js, and *.tsx files under the src folder.
for filepath in $(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \)); do
    # Read each line of the file.
    while read -r line; do
        # If the line starts with 'export', then process it.
        if [[ $line == export* ]]; then
            # Extract the exported variable or function name.
            # Note: This is a simplistic extraction that may not work for all export types.
            export_name=$(echo $line | sed -n -E 's/export[[:space:]]+(const|let|var|function|class|interface|type|enum)?[[:space:]]*([a-zA-Z0-9_]+).*/\2/p')
            
            # If export_name is non-empty, format the export command for the central index.tsx file.
            if [ ! -z "$export_name" ]; then
                # Extract relative path without src and extension
                relative_path=$(echo $filepath | sed -E 's/^src\/|\.tsx?$|\.js?$//g')
                # Format the export command.
                formatted_exports+="export { $export_name } from '../src/$relative_path';"$'\n'
            fi
        fi
    done < "$filepath"
done

# Write the formatted export commands to a central index.tsx file.
echo -e "$formatted_exports" > src/index.tsx
