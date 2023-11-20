const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const ejs = require("ejs");
const cors = require("cors");
const expressWs = require("express-ws");

const app = express();
const server = http.createServer(app);
expressWs(app, server);

app.set("trust proxy", true);
app.use(cors());

const connectedClientsSet = new Set();

const io = socketIO(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

// Function to broadcast updates to all WebSocket clients
const broadcastUpdate = () => {
    const connectedClientsArray = [...connectedClientsSet];
    io.emit("updateConnectedClients", connectedClientsArray);
};

io.on("connection", socket => {
    const clientIpAddress = socket.handshake.address;
    const ipAddressOnly = clientIpAddress.replace(/^.*:/, '');

    connectedClientsSet.add(ipAddressOnly);
    console.log(`${socket.id} A user connected from IP: ${ipAddressOnly}`);
    console.log("Connected Clients:", [...connectedClientsSet]);

    // Broadcast the initial list of connected clients to all WebSocket clients
    broadcastUpdate();

    socket.on("disconnect", () => {
        connectedClientsSet.delete(ipAddressOnly);
        console.log(`User disconnected from IP: ${ipAddressOnly}`);
        console.log("Connected Clients:", [...connectedClientsSet]);

        // Broadcast the updated list of connected clients to all WebSocket clients
        broadcastUpdate();
    });
});

app.set("view engine", "ejs");
app.set("views", __dirname);

app.get("/", (req, res) => {
    res.render("index", { connectedClients: [...connectedClientsSet] });
});

app.ws("/connectedClients", (ws, req) => {
    // Send the initial list of connected clients
    ws.send(JSON.stringify([...connectedClientsSet]));
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
