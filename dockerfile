FROM node:16-alpine
LABEL author="roycrxtw@gmail.com"

ARG APP_ENV

# Set up environment variables
ENV APP_NAME assessment-hahow
ENV APP_TYPE api
ENV NODE_ENV ${APP_ENV:-dev}
ENV PORT 3310

# Create app directory
RUN mkdir -p /var/app/${APP_NAME}-${APP_TYPE}
WORKDIR /var/app/${APP_NAME}-${APP_TYPE}

# Set up pm2
# Reference: pm2-logrotate config https://github.com/pm2-hive/pm2-logrotate#configure
RUN npm install pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M
RUN pm2 set pm2-logrotate:compress true
RUN pm2 set pm2-logrotate:retain 10
RUN pm2 set pm2-logrotate:workerInterval 3600
RUN pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# Clone the public repo
RUN apk add --no-cache git
RUN git clone https://github.com/roycrxtw/assessment-hahow.git /var/app/${APP_NAME}-${APP_TYPE}

RUN npm install --production

# Generate apidoc
RUN npm run doc

EXPOSE ${PORT}

# Booting
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
