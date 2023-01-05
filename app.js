const express = require('express');
const bodyParser = require('body-parser');
// create express app
const app = express();
var cors = require('cors')
// Setup server port
const port = process.env.PORT || 4002;
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())
app.use(cors())
// Configuring the database
const dbConfig = require('./config/db.config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Connecting to the database
const http = require('http').createServer(app); //ajeet
// inside public directory.
app.use('/image', express.static(__dirname + '/uploads'));

app.get('/', function(req,res){
  console.log(req.body)
  console.log(req.params)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`
  xml += `<user>`
  for (let i = 0; i < 99; i++) {
    xml += `
    <customer> 
        <firstName>Henry</firstName>
        <lastName>William</lastName>
    </customer>`
  }
  xml += `</user>`
  res.header('Content-Type', 'application/xml')
  res.status(200).send(xml)
});
app.post('/', function(req,res){
  console.log(req.params)
  console.log(req.body)
  res.send({sucess: true})
});

//all socket
require('./socket')(http, app); 

mongoose.set("strictQuery", false);
mongoose.connect(dbConfig.url, {
useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database.', err);
  process.exit();
});

dbConfig.allRoutes.map((e) =>{
  if(e.status) app.use(`${e.version}${e.apiType}`, require(`./routes/${e.routes}.js`))
})

// define a root/default route
app.get('/', (req, res) => {
   res.json({"message": "Hello World"});
});
// const userRoutes = require('./routes/user')
// using as middleware
// app.use('/api/users', userRoutes)
// listen for requests
app.listen(port, () => {
   console.log(`Node server is listening on port ${port}`);
});