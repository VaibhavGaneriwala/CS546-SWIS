import express from "express";
import exphbs from "express-handlebars";
import configRoutesFunction from "./routes/index.js";
import { requestLogger } from "./middleware.js";

const app = express();

// set /public dir for static access
app.use("/public", express.static("public"));

// json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// express handlebars config
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// middleware: log meta-data of each request for debugging
app.use("/", requestLogger);

// config app's routes
configRoutesFunction(app);

app.listen(3000, () => console.log("Server running at http://localhost:3000"));

