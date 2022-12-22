module.exports = {
    url: 'mongodb://localhost:27017/newProject',
    jwtSecretKey: '12@e3s@#@',
    allRoutes: [
        {
            routes: "user",
            version: "/api/v1",
            apiType: "/user",
            status: true
        }, 
        {
            routes: "admin",
            version: "/api/v1",
            apiType: "/admin",
            status: true
        }
    ]
}