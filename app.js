import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import configRoutes from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        contentFor: function (name, options) {
            if (!this._blocks) this._blocks = {};
            this._blocks[name] = options.fn(this);
            return null;
        },
        block: function (name) {
            return this._blocks && this._blocks[name] ? this._blocks[name] : '';
        },
        eq: function (a, b) {
            return a === b;
        },
        json: function (context) {
            return JSON.stringify(context);
        }
    }
});
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

/* middleware to set res.locals.user except for login and register
allowing sidebar to render on all pages except login and register */
app.use((req, res, next) => {
    if (req.path !== '/login' && req.path !== '/register') {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    res.locals.currentPath = req.path;
    next();
});

configRoutes(app);

app.listen(3000, () => console.log("Server running at http://localhost:3000"));