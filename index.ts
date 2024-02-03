// console.log("Hello via Bun, motherfucker!");

import { parseArgs } from "util";
import logUpdate from "log-update";
import * as nodemailer from "nodemailer";
import { faker } from '@faker-js/faker';


const transporter: nodemailer.Transporter = nodemailer.createTransport({
  host: process.env.HOST || "mailpit",
  port: process.env.PORT || 1025,
  secure: false,
  auth: {
    user: 'user',
    pass: 'pass'
  }
});

const { values } = parseArgs({
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
    }
  },
  strict: true,
  allowPositionals: true,
});


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

const SendersCount = parseInt(process.env.SENDERS || values.senders || "10", 10);
const RandomInterval = parseInt(process.env.INTERVAL || values.interval || "250", 10)
const MaxParagraphs = parseInt(process.env.PARAGRAPHS || values.paragraphs || "10", 10)
console.log(`Current config: `, {SendersCount, RandomInterval, MaxParagraphs});
console.log("");

// Allow random interval to give us at least 4 samples
// to calculate speed
const StatsInterval = RandomInterval * 4;

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
      text
    });
    setTimeout(sendEmail, Math.floor(Math.random() * RandomInterval));
  };

  sendEmail();
}

const startedAt = new Date();

for (let i = 0; i < SendersCount; i++) {
  // console.log("Adding sender", i);
  createSender(i);
}

function printStats() {
  let totalSpeed = 0;
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
      const speed = diff * 1000 / StatsInterval;
      totalSpeed += speed;

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

  const avgBodySize = totalCount > 0 ? totalBodySize / totalCount / 1024 : 0;
  const bodyThroughput = (totalBodySize - stats.totalBodySize) / 1024 / 1024 * 1000 / StatsInterval;
  stats.totalBodySize = totalBodySize;
  const elapsedSeconds = Math.round(((new Date()).getTime() - startedAt.getTime()) / 1000);

  const statsMessage = `Nodemailer stress test running \n
${sendersMessage}
Total speed: ${totalSpeed} msg/s
Avg body size: ${avgBodySize.toFixed(2)} kb
Body throughput: ${bodyThroughput.toFixed(2)} mb/s
Elapsed seconds: ${elapsedSeconds}
`;

  logUpdate(statsMessage);
  //console.log(statsMessage);
}

setInterval(printStats, 500);
