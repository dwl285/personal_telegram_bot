#!/bin/sh

# Decrypt global credentials
gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
  --output .globalclasprc.json clasp_creds/.globalclasprc.json.gpg
  
 # Decrypt local credentials
gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
  --output .localclasprc.json clasp_creds/.localclasprc.json.gpg
