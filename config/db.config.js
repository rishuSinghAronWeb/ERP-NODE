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
        }, 
        {
            routes: "project",
            version: "/api/v1",
            apiType: "/project",
            status: true
        }, 
        {
            routes: "hr",
            version: "/api/v1",
            apiType: "/hr",
            status: true
        }, 
        {
            routes: "projectManager",
            version: "/api/v1",
            apiType: "/projectManager",
            status: true
        }
    ]
}