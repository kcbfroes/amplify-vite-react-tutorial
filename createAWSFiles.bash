#!/bin/bash
set -e
IFS='|'

# Create .aws folder in the "home" directory
mkdir -p ~/.aws

# Create AWS credential file inside ~/.aws
echo "[default]" >> ~/.aws/credentials
echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> ~/.aws/credentials
echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> ~/.aws/credentials
echo "aws_session_token=$AWS_SESSION_TOKEN" >> ~/.aws/credentials

# Create AWS config file ~/.aws
echo "[default]" >> ~/.aws/config
echo "region=$AWS_DEFAULT_REGION" >> ~/.aws/config
