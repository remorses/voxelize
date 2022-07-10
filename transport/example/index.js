const { Transport } = require("../dist/index.cjs");

const transport = new Transport();

transport.on("connectFailed", function (error) {
  console.log(`Connect Error: ${error.toString()}`);
});

transport.on("connect", function (connection) {
  console.log("WebSocket Client Connected");

  setInterval(() => {
    transport.send({
      type: "TRANSPORT",
      text: "world3",
      json: [0, 80, 0],
    });
  }, 100);

  connection.on("error", function (error) {
    console.log(`Connection Error: ${error.toString()}`);
  });

  connection.on("close", function () {
    console.log("echo-protocol Connection Closed");
  });

  connection.on("message", function (message) {
    if (message.type === "binary") {
      console.log(`Received: '${message.binaryData}'`);
    }
  });
});

transport.connect("ws://127.0.0.1:4000/", "test");
