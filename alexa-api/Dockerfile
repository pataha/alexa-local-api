FROM node:latest
MAINTAINER Keaton Taylor <keatonstaylor@gmail.com>

RUN apt-get update

# Installing the packages needed to run Nightmare
RUN apt-get install -y \
  xvfb \
  x11-xkb-utils \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-scalable \
  xfonts-cyrillic \
  x11-apps \
  clang \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  jq

ENV DEBUG="nightmare"

RUN mkdir -p /workspace
WORKDIR /workspace
RUN mkdir ./tmp

ADD package.json .

RUN npm install

ADD . .

EXPOSE 8091

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
