const express = require('express');
const http = require('http');
const path = require('path');
const Heroku = require('heroku-client')


const heroku = new Heroku({ token: 'f51948a4-8f62-4cdc-9c83-66e123f37d81' })


const api = require('./server/routes/api');

const app = express();

let TOKEN = '';


app.use(express.static(path.join(__dirname, 'dist')));


heroku.request({
  method: 'GET',
  path: 'https://api.heroku.com/apps/nhl-starting-goalies-angular/config-vars',
  headers: {
    "Accept": "application/vnd.heroku+json; version=3",
    "Authorization": "Bearer f51948a4-8f62-4cdc-9c83-66e123f37d81"
  },
  parseJSON: true
}).then(response => {
  //console.log(response.API_KEY, "heroku api from server");
  TOKEN = response.TOKEN;
})

app.get('/heroku-env', (req, res) => {
        res.write(TOKEN);
        res.end();
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
});


const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
