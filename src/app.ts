import express from "express";
import { connectToDB } from "./connection";
import routes from "./routes/index";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());



app.use(routes);
app.listen(8000, () => console.log("Listening..."));

connectToDB() 