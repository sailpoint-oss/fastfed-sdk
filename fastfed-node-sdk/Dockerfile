FROM node:10.16.3

# docker build --no-cache -t fastfed-idp .

# windows
# docker run --rm -v %cd%:/source/fastfed-node-sdk --name fastfed-node-sdk -it fastfed-node-sdk

# linux
# docker run --rm -v $(pwd):/source/fastfed-node-sdk --name fastfed-node-sdk -it fastfed-node-sdk

# parts used from this article
# https://jdlm.info/articles/2019/09/06/lessons-building-node-app-docker.html
ARG SOURCE_DIR=/source/fastfed-node-sdk
RUN mkdir -p ${SOURCE_DIR} && chown node:node ${SOURCE_DIR}

RUN npm install -g typescript

USER node
WORKDIR ${SOURCE_DIR}

RUN mkdir -p ./dist

COPY ./package.* ./
COPY ./package.* ./dist


RUN cd dist && \
    npm install

CMD ["npm", "run", "watch"]

