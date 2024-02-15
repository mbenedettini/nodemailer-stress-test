const SMTPServer = require("smtp-server").SMTPServer;

// const server = new SMTPServer({
//   authOptional: true,
//   disableReverseLookup: true,
//   onAuth(auth, session, callback) {
//     console.log(">>>>>>>>>> ON AUTH");
//     callback(null, { user: 123 }); // where 123 is the user id or similar property
//   },
// });

const server = new SMTPServer({
  disableReverseLookup: true,
  disabledCommands: ['STARTTLS', 'AUTH'],
  onData(stream, session, callback) {
    let data = '';
    stream.on('data', chunk => {
      data += chunk;
    });
    stream.on('end', () => {
      callback();
    });
  },
});

server.on("error", (err) => {
  console.log("Error %s", err.message);
});

server.listen(1025, '0.0.0.0', () => {
  console.log(`SMTP server is listening on port 1025`);
});
