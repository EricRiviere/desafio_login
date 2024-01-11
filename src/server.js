import express from "express";
import { ProductRouter } from "./routes/products.routes.js";
import { CartsRouter } from "./routes/carts.routes.js";
import handlebars from "express-handlebars";
import { __dirname } from "./utils.js";
import { viewsRouter } from "./routes/views.routes.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import messagesDao from "./dao/mdbManagers/messages.dao.js";
import sessionsRouter from "./routes/sessions.routes.js";
import userViewRouter from "./routes/users.views.routes.js";
import session from "express-session";
import MongoStore from "connect-mongo";

//Server
const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
  `Server listening on port ${PORT}`;
});

//Mongoose
const MONGO_URL =
  "mongodb://localhost:27017/DesafioLogin?retryWrites=true&w=majority";

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 5 * 60,
    }),
    secret: "d3saFi0L0giN",
    resave: false,
    saveUninitialized: true,
  })
);

const connectMondoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado con exito a la DB usando Mongoose!!");
  } catch (error) {
    console.error("No se pudo conectar a la BD usando Moongose: " + error);
    process.exit();
  }
};
connectMondoDB();

//SocketServer
const io = new Server(httpServer);

//Midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Api routers
app.use("/api/products", ProductRouter);
app.use("/api/carts", CartsRouter);

//Handlebars
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);

//Static
app.use(express.static(`${__dirname}/public`));

//ViewRouter
app.use("/", viewsRouter);
app.use("/users", userViewRouter);
app.use("/api/sessions", sessionsRouter);

//Socket
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("message", async (data) => {
    console.log(data);
    await messagesDao.createMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});
