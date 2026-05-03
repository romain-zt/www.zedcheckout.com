#!/bin/bash
# Warns when raw color values are used instead of design system tokens in TSX files.

input=$(cat)
file=$(echo "$input" | jq -r '.file // ""')

if [ -z "$file" ] || [[ ! "$file" == *.tsx ]]; then
  echo '{}'
  exit 0
fi

# Check for raw indigo/purple/violet color classes (should use primary/oneiric tokens)
if grep -qE 'bg-(indigo|purple|violet)-|text-(indigo|purple|violet)-|border-(indigo|purple|violet)-' "$file" 2>/dev/null; then
  cat <<EOF
{
  "notification": "Design system: use semantic tokens (primary/oneiric/accent) instead of raw color classes (indigo/purple/violet). See .cursor/rules/core/design-system.mdc"
}
EOF
else
  echo '{}'
fi
