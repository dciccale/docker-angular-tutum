# This image will be based on the oficial nodejs docker image
FROM node:alpine

ADD package.json /tmp/package.json

# Install dependencies
RUN cd /tmp \
    npm install -g bower && \
    npm install --no-progress && \
    bower install --config.interactive=false --allow-root

RUN mkdir -p /home/app && cp -a /tmp/node_modules /home/app/

# Set in what directory commands will run
WORKDIR /home/app

# Put all our code inside that directory that lives in the container
ADD . /home/app

# Tell Docker we are going to use this port
EXPOSE 9000

# The command to run our app when the container is run
CMD ["node", "server/app.js"]
