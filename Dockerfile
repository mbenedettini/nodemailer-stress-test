FROM --platform=amd64 debian:12.4
WORKDIR /app
SHELL ["/bin/bash", "-o", "pipefail", "-ex", "-c"]
#RUN set -o pipefail -ex
RUN apt update && apt install -y curl unzip
# RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.0.25"
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && apt install -y nodejs
COPY . /app
RUN npm i
# CMD /root/.bun/bin/bun run index.ts
CMD npx tsx index.ts
