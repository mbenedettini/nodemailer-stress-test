# nodemailer-stress-test

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


# Docker image

```bash
docker build -t marianobe/nodemailer-stress-test .
docker push marianobe/nodemailer-stress-test
```

# Docker usage example:

```bash
$ docker run -e SENDERS=14 -e INTERVAL=10  -e PARAGRAPHS=100  -e HOST=host.docker.internal -e PORT=1025 marianobe/nodemailer-stress-test
```

# Mailpit
```bash
$ docker run -p 8025:8025 \
-p 1025:1025 \
axllent/mailpit
```

# Custom Server
```bash
$ docker run -p 1025:1025 marianobe/nodemailer-stress-test /root/.bun/bin/bun run server.ts
```

# Install Docker in Debian

```bash
apt update && apt install -y apt-transport-https ca-certificates curl software-properties-common lsb-release gnupg
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update && apt install -y docker-ce docker-ce-cli containerd.io
```