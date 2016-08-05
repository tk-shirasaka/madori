var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(app.get('port'), (req, res) => {
});
