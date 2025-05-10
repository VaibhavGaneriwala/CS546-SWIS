// middleware that logs request information
export function requestLogger(req, res, next) {
    console.log(`Current Timestamp: ${new Date().toUTCString()}`);
    console.log(`Request Method: ${req.method}`);
    console.log(`Request Path: ${req.path}`);
    console.log("\n");
    next();
}