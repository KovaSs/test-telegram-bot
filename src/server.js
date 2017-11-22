const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

app.use('/', function(req,res) {
  res.sendFile(__dirname + '/index.html');
})

app.listen(process.env.PORT || 5000);