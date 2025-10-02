#!/bin/bash

# Environment encryption/decryption utility
set -eo pipefail

ENV_FILE="${1:-.env}"
ENCRYPTED_FILE="$ENV_FILE.enc"
KEY_FILE="${2:-./.env.key}"

validate_env() {
  required_vars=(
    "DATABASE_URL"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "NX_CLOUD_ACCESS_TOKEN"
  )

  for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
      echo "Missing required variable: $var"
      exit 1
    fi
  done
}

generate_key() {
  if [ ! -f "$KEY_FILE" ]; then
    openssl rand -hex 32 > "$KEY_FILE"
    chmod 600 "$KEY_FILE"
  fi
}

encrypt_env() {
  validate_env
  generate_key
  openssl enc -aes-256-cbc -md sha256 -salt \
    -in "$ENV_FILE" -out "$ENCRYPTED_FILE" \
    -pass file:"$KEY_FILE"
  echo "Encrypted environment stored in $ENCRYPTED_FILE"
}

decrypt_env() {
  generate_key
  openssl enc -d -aes-256-cbc -md sha256 -salt \
    -in "$ENCRYPTED_FILE" -out "$ENV_FILE" \
    -pass file:"$KEY_FILE"
  chmod 600 "$ENV_FILE"
}

case "$1" in
  encrypt) encrypt_env ;;
  decrypt) decrypt_env ;;
  *) echo "Usage: $0 [encrypt|decrypt]" ; exit 1 ;;
esac