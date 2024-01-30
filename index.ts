// console.log("Hello via Bun, motherfucker!");

import { parseArgs } from "util";
import logUpdate from "log-update";
import * as nodemailer from "nodemailer";

const transporter: nodemailer.Transporter = nodemailer.createTransport({
  host: "mailpit",
  port: 1025,
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
      default: "250"
    }
  },
  strict: true,
  allowPositionals: true,
});


type Sender = {
  count: number
};

let stats: {
  senders: {
    [index: number]: Sender
  }
} = {
  senders: {}
};

const SendersCount = parseInt(values.senders || "10", 10);
const RandomInterval = parseInt(values.interval || "250", 10)
// console.log(SendersCount, RandomInterval);

function sender(index: number) {
  stats.senders[index] = {
    count: 0
  };

  var sendEmail: () => void = async () => {
    stats.senders[index].count++;
    await transporter.sendMail({
      from: `"Sender #${index}" <sender-${index}@localhost>`,
      to: "rcpt@localhost",
      subject: `Hello #${index} - ${stats.senders[index].count}`,
      text: `Hello #${index} - ${stats.senders[index].count}`
    });
    setTimeout(sendEmail, Math.floor(Math.random() * RandomInterval));
  };

  sendEmail();
}

for (let i = 0; i < SendersCount; i++) {
  // console.log("Adding sender", i);
  sender(i);
}

function printStats() {
  const sendersMessage = Object.keys(stats.senders).length > 0 ?
    Object.keys(stats.senders).map((sIndex: string) => {
      const index = parseInt(sIndex, 10);
      const sender = stats.senders[index];
      return `Sender #${index}: ${sender.count}`;
    }).join("\n")
    : `No senders as of ${new Date()}`;
  const statsMessage = `Nodemailer stress test running
${sendersMessage}
`;

  logUpdate(statsMessage);
}

setInterval(printStats, 500);
