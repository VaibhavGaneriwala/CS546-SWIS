export { authMiddleware };

const authMiddleware = (options = {}) => {
    return (req, res, next) => {
        const isAuthenticated = !!req.session.user;
        if (options.requireAuth && !isAuthenticated) {
            return res.redirect('/login');
        }
        if (options.authMiddleware && isAuthenticated) {
            return res.redirect('/dashboard');
        }
        next();
    };
};