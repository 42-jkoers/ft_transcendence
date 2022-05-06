import { io } from 'socket.io-client';

class SocketioService {
    socket;
    constructor() {}

    setupSocketConnection() {
        this.socket = io('http://localhost:3000');
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketioService();

// This will declare a variable named socket
// After calling the setupSocketConnection method,
// socket variable would be containing the connected socketio object.
