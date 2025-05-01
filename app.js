// importing modules
import express from "express";
import exphbs from "express-handlebars";
import indexRoutes from "./routes/index.js";
import { requestLogger } from "./middleware.js";

const app = express();

app.use("/public", express.static("public"));

// json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// express handlebars config
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("/", requestLogger);

// config app's routes
configRoutesFunction(app);

app.listen(3000, () => console.log("Server running at http://localhost:3000"));