// console.log("Hello via Bun, motherfucker!");

import { parseArgs } from "util";
import logUpdate from "log-update";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    senders: {
      type: "string",
      default: "1"
    },
    interval: {
      type: "string",
      default: "250"
    }
  },
  strict: true,
  allowPositionals: true,
});

// console.log(values);
// console.log(positionals);

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

const SendersCount = parseInt(values.senders || "1", 10);
const RandomInterval = parseInt(values.interval || "250", 10)
// console.log(SendersCount, RandomInterval);

function sender(index: number) {
  stats.senders[index] = {
    count: 0
  };

  var sendEmail: () => void = () => {
    stats.senders[index].count++;
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
