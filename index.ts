// console.log("Hello via Bun, motherfucker!");

// import { parseArgs } from "util";
import logUpdate from "log-update";
import * as nodemailer from "nodemailer";
import { faker } from '@faker-js/faker';

process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  process.exit();
});

function generateRandomBinaryBuffer(sizeInKB: number): Buffer {
  const sizeInBytes = sizeInKB * 1024;
  const buffer = Buffer.alloc(sizeInBytes);

  for (let i = 0; i < sizeInBytes; i++) {
    // Fill the buffer with random bytes
    buffer[i] = Math.floor(Math.random() * 256);
  }

  return buffer;
}

/* const { values } = parseArgs({
  args: Bun.argv,
  options: {
    senders: {
      type: "string",
      default: "10"
    },
    interval: {
      type: "string",
      default: "50"
    },
    paragraphs: {
      type: "string",
      default: "10"
    },
    attachmentSize: {
      type: "string",
      default: "0"
    },
    localAddress: {
      type: "string",
      default: ""
    }
  },
  strict: true,
  allowPositionals: true,
}); */


type Sender = {
  count: number,
  prevCount: number,
  bodySize: number
};

let stats: {
  senders: {
    [index: number]: Sender
  },
  totalBodySize: number
} = {
  senders: {},
  totalBodySize: 0
};

const SendersCount = parseInt(process.env.SENDERS || "10", 10);
const RandomInterval = parseInt(process.env.INTERVAL || "250", 10);
const MaxParagraphs = parseInt(process.env.PARAGRAPHS || "10", 10);
const AttachmentSize = parseInt(process.env.ATTACHMENT_SIZE || "0", 10);
const LocalAddress = process.env.LOCAL_ADDRESS;
console.log(`Current config: `, {SendersCount, RandomInterval, MaxParagraphs, AttachmentSize, LocalAddress});

const transportConfig = {
  host: process.env.HOST || "server",
  port: parseInt(process.env.PORT || "0") || 1025,
  secure: false,
  // auth: {
  //   user: 'user',
  //   pass: 'pass'
  // },
  pool: true,
  maxConnections: 1000,
  maxMessages: 10000,
  ...(LocalAddress ? {localAddress: LocalAddress} : {})
};

console.log(transportConfig);

const transporter: nodemailer.Transporter = nodemailer.createTransport(transportConfig);

let attachment: Buffer;
if (AttachmentSize > 0) {
  attachment = generateRandomBinaryBuffer(AttachmentSize);
}

const StatsInterval = 500;

function getRandomNumber(min: number, max: number) {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomFraction = Math.random();

  // Scale and shift the random fraction to the desired interval
  const randomInRange = randomFraction * (max - min) + min;

  // Return the result
  return randomInRange;
}

function createSender(index: number) {
  stats.senders[index] = {
    count: 0,
    prevCount: 0,
    bodySize: 0
  };

  var sendEmail: () => void = async () => {
    stats.senders[index].count++;
    const text = faker.lorem.paragraphs({
      min: Math.floor(MaxParagraphs * 0.75),
      max: MaxParagraphs
    });
    stats.senders[index].bodySize += text.length;
    await transporter.sendMail({
      from: `"Sender #${index}" <sender-${index}@localhost>`,
      to: "rcpt@localhost",
      // subject: `Hello #${index} - ${stats.senders[index].count}`,
      subject: faker.lorem.sentence({ min: 3, max: 10}),
      // text: `Hello #${index} - ${stats.senders[index].count}`,
      text,
      ...(attachment ? { attachments: [{filename: "attachment1.jpg", content: attachment}] }: {})
    });
    setTimeout(sendEmail, 0);
  };

  sendEmail();
}

const startedAt = new Date();

for (let i = 0; i < SendersCount; i++) {
  // console.log("Adding sender", i);
  createSender(i);
}

function printStats() {
  let instantSpeed = 0;
  let totalBodySize = 0;
  let totalCount = 0;

  let sendersMessage = `No senders as of ${new Date()}`;
  if (Object.keys(stats.senders).length > 0) {
    let msgs: string[] = [];
    Object.keys(stats.senders).forEach((sIndex: string) => {
      const index = parseInt(sIndex, 10);
      const sender = stats.senders[index];

      // Count Calc
      const diff = sender.count - sender.prevCount;
      sender.prevCount = sender.count;

      // Speed calc
      const speed = (diff * 1000) / StatsInterval;
      instantSpeed += speed;

      // Totals and avg body size
      totalBodySize += sender.bodySize;
      totalCount += sender.count;
      const avgBodySize = sender.bodySize / sender.count / 1024;

      //
      msgs.push(`Sender #${index}: ${sender.count} msgs sent. \
Speed: ${speed.toFixed(2)} msg/s. \
Avg body size: ${avgBodySize.toFixed(2)} kb.`);
    })
    sendersMessage = msgs.join("\n");
  }

  const elapsedSeconds = parseFloat(
    (((new Date()).getTime() - startedAt.getTime()) / 1000)
      .toFixed(2)
  );
  const avgBodySize = totalCount > 0 ? totalBodySize / totalCount / 1024 : 0;
  const avgSpeed = totalCount > 0 ? totalCount / elapsedSeconds: 0;
  const bodyThroughput = (totalBodySize - stats.totalBodySize) / 1024 / 1024 * 1000 / StatsInterval;
  stats.totalBodySize = totalBodySize;

  const statsMessage = `Nodemailer stress test running \n
${sendersMessage}
Total sent messages: ${totalCount}
Instant speed: ${instantSpeed} msg/s
Avg speed: ${avgSpeed.toFixed(2)} msg/s
Avg body size: ${avgBodySize.toFixed(2)} kb
Body throughput: ${bodyThroughput.toFixed(2)} mb/s
Elapsed seconds: ${elapsedSeconds}
`;

  logUpdate(statsMessage);
  //console.log(statsMessage);
}

setInterval(printStats, StatsInterval);
