const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const path = require('path')

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;



io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});


//fron-end
app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", function (_, res) {
	res.sendFile(
		path.join(__dirname, "./client/build/index.html"),
		function (err) {
			res.status(500).send(err);
		}
	);
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// app.listen(PORT, async () => {
// 	try {
// 		// await dbConfig();
// 		console.log(`Listening at ${PORT}`);
// 	} catch (e) {
// 		console.log(e.message);
// 	}
// })
