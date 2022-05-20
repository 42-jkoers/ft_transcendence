import { io, Socket } from "socket.io-client";

class SocketioService {
  socket?: Socket;
  constructor() {
    // do nothing.
  }
  setupSocketConnection() {
    this.socket = io("http://localhost:3000/chat", {
      transports: ["websocket"],
      withCredentials: true,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  release(event: string, message: string) {
    if (this.socket) {
      this.socket.emit(event, message);
    }
  }
}

export default new SocketioService();
