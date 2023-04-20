import express from "express";
import { connectToDB } from "./connection";

const app = express();

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(8000, () => console.log("Listening..."));

connectToDB()