import express from "express";
import {userRoutes} from "./userRoutes.js";
import {productRoutes} from "./productRoutes.js";


function constructorMethod(app) {
    app.use(/(.*)/, (req, res) => {
        res.status(404).render("error", {
            title: "Error",
            error: "Page not Found"
        });
    });
}

export default constructorMethod;