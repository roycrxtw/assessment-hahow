#!/bin/bash

echo "setup.sh started"
sudo su
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 913334248731.dkr.ecr.us-west-2.amazonaws.com
docker pull 913334248731.dkr.ecr.us-west-2.amazonaws.com/rx-assessment-hahow:latest
docker tag 913334248731.dkr.ecr.us-west-2.amazonaws.com/rx-assessment-hahow:latest  assessment-hahow-api:latest

echo "Display current images"
docker images
