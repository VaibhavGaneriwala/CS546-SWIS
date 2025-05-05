import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
import path from "path";
import {fileURLToPath} from "url";
import configRoutes from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    name: 'SWISSession',
    secret: 'cs546-swis',
    resave: false,
    saveUninitialized: false,
  })
);

configRoutes(app);

app.listen(3000, () => console.log("Server running at http://localhost:3000"));