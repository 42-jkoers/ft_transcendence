import { io, Socket } from "socket.io-client";

class SocketioService {
  socket?: Socket;
  constructor() {
    // do nothing.
  }

  setupSocketConnection() {
    this.socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketioService();
