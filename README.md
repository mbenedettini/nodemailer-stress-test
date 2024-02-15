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
