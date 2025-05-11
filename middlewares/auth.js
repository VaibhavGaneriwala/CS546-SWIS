// Middleware for protected routes (dashboard, inventory, etc.)
export const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Middleware for auth routes (login, register)
export const guestMiddleware = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

// Middleware for admin inventory routes
export const inventoryRedirectMiddleware = (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/login')
    }

    if(req.session.user.roleName === 'admin'){
        return res.redirect('/inventory/admin')
    }

    return res.redirect('/inventory/user')
};

//middleware for admin routes
export const adminOnly = (req, res, next) => {
    if(req.session.user?.roleName !== 'admin'){
        return res.status(403).render("error", {
        title: "Access Denied",
        error: "You are not authorized to access this resource."
        })
    }
    next()
};