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