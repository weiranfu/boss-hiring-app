export const serverConfig = {
  url: process.env.SEVER_URI || "http://localhost:4000",
};

export const socketIOConfig = {
  url: process.env.SOCKETIO_URI || "ws://localhost:4000",
};
