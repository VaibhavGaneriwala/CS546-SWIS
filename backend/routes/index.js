// import all routes here
// ex: import usersRouter from "./users.js";

function constructorMethod(app) {

    // mount routes to web server here
    // ex: app.use("/", importedRouter);

    // render 404 error for unintended endpoints
    app.use(/(.*)/, (req, res) => {
        res.status(404).render("error", {
            title: "Error",
            error: "Page not Found"
        });
    });
}

export default constructorMethod;