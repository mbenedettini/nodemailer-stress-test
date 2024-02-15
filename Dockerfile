FROM --platform=amd64 debian:12.4
WORKDIR /app
SHELL ["/bin/bash", "-o", "pipefail", "-ex", "-c"]
#RUN set -o pipefail -ex
RUN apt update && apt install -y curl unzip
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.0.25"
COPY . /app
CMD /root/.bun/bin/bun run index.ts
