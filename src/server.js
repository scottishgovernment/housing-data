const express = require('express');
const app = express();
const port = 9094;
const router = express.Router();

const config = require('config-weaver').config();

const CPIStore = require('./CPIStore');
const CPISource = require('./CPISource');
const URLCPISource = require('./URLCPISource');
console.log('->', config.couch.url);
const store = new CPIStore(config.couch.url);
const onsSource = new URLCPISource(config.ons.cpiUrl);
const source = new CPISource(onsSource, store);

// rout for getting the latest CPI figure
router.get('/latestCPI', function(req, res) {

    source.get((error, cpi) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        res.json(cpi);
    });

});

app.use(router);
app.listen(port);
console.log('Listening on port ' + port);
