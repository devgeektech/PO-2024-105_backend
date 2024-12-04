import http from "http";
import express from "express";
import { applyMiddleware, applyRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import routes from "./services";
import mongoose = require("mongoose");
import config from "config";
import multer from "multer";
import path from "path";
import 'dotenv/config';
const { Server } = require("socket.io");

const router = express();
router.set('views', path.join(__dirname, 'views'));
router.set("view engine", "ejs");

const upload = multer({
  storage: multer.diskStorage({
      destination: (req, file, cb) => {
          cb(null, "temp/")
      },
      filename: (req, file, cb) => {
          let customFileName =Date.now();
          let fileExtension = path.extname(file.originalname).split('.')[1];
          cb(null, customFileName + '.' + fileExtension)
      }
    })
  })
  
router.use(upload.any());
router.use(express.static('./temp'))
applyMiddleware(middleware, router);
applyRoutes(routes, router);
applyMiddleware(errorHandlers, router);

const PORT = config.get("MONGO_CRED.PORT") || 9000;
export const server = http.createServer(router);

export const io = new Server(server, {
  cors: {
    origin: config.get("SITE_URL"), // Allow requests from this origin and my frontend port = 5173
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});

mongoose
  .connect(`${config.get("MONGO_CRED.MONGO_PATH")}/${config.get("MONGO_CRED.DATABASE")}`, {  })
  .then(() => {
    server.listen(PORT);
    console.log(`Server is running http://localhost:${PORT}...`);
    // Utilities.createDefaultSlotsIfNotExists()
  })
  .catch((err) => {
    console.log(err,"server.js file");
  });
