var fs = require('fs'),
    levelup = require('levelup'),
    leveldown = require('leveldown'),
    Client = require('bitcoin-core');

var cors = require('cors');
var express = require('express');
var https = require('https');
var privateKey = fs.readFileSync('<path-to-cert-private-key>.pem');
var certificate = fs.readFileSync('<path-to-cert>.pem');
var app = express();
app.use(cors());
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var bitcoin = new Client({
    port: 420,
    username: '<bongger-rpc-username>',
    password: '<bongger-rpc-password>'
});

var mempool = [];
var db = levelup(leveldown('./addressdb'));
var txdb = levelup(leveldown('./txdb'));

async function checkMempool() {
    try {
        var pool = await bitcoin.getRawMempool();
        for (var i = 0; i < pool.length; i++) {
            if (!mempool.find(item => item == pool[i])) {
                mempool.push(pool[i]);
                await handleTransaction(pool[i], true);
            }
        }
        var toRemove = [];
        mempool.forEach(txid => {
    if (!pool.find(item => item == txid)) {
        toRemove.push(txid);
    }
});
toRemove.forEach(txid => {
    mempool.splice(mempool.indexOf(txid), 1);
});
} catch (ex) {
    console.log(ex);
}
}

function getIndexedHeight() {
    return new Promise((o, x) => {
        fs.readFile('height', (err, data) => {
            if (err) o(0);
            else o(parseInt(data.toString()));
        });
    });
}

function AddressData(address) {
    this.address = address;
    this.unspent = {};
}

async function get(address) {
    var data = new AddressData(address);
    try {
        data.unspent = JSON.parse((await db.get(address)).toString());
    } catch (ex) {
        // address not found
    }
    return data;
}

async function getTxoutAddress(txidVout) {
    var address;
    try {
        address = (await txdb.get(txidVout)).toString();
    } catch (ex) {
        // txout not found
    }
    return address;
}

function put(addressData) {
    return db.put(addressData.address, JSON.stringify(addressData.unspent));
}

async function handleTransaction(txid, pending) {
    try {
        var tx = await bitcoin.getRawTransaction(txid, 1);
        for (var i = 0; i < tx.vout.length; i++) {
            var out = tx.vout[i];
            if (parseFloat(out.value) > 0 && out.scriptPubKey.addresses) {
                for (var j = 0; j < out.scriptPubKey.addresses.length; j++) {
                    var address = out.scriptPubKey.addresses[j];
                    var addressData = await get(address);
                    addressData.unspent[txid + "-" + out.n] = {
                        time: tx.time,
                        txid: tx.txid,
                        vout: out.n,
                        value: out.value,
                        };
if (pending) {
    addressData.unspent[txid + "-" + out.n].pending = true;
}
else {
    delete addressData.unspent[txid + "-" + out.n].pending;
}
//     console.log("Adding txdb " + txid+out.n);
await txdb.put(txid + out.n, address);
//     console.log("Adding address " + JSON.stringify(addressData));
await put(addressData);
                    }
                }
            }
for (var k = 0; k < tx.vin.length; k++) {
    if (!tx.vin[k].coinbase) {
        var vout = tx.vin[k].vout;
        var txidt = tx.vin[k].txid;
        //    console.log("Getting txdb " + txidt);
        var address = await getTxoutAddress(txidt + vout);
        if (address) {
            var toRemove = await get(address);
            //      console.log("Removing from " + address);
            delete toRemove.unspent[txidt + "-" + vout];
            if (Object.keys(toRemove).length === 0) {
                await db.del(address);
            } else {
                await put(toRemove);
            }
            await txdb.del(txidt + vout);
        }
    }
}
    } catch(ex) {
    console.log(ex);
}
}
async function loadFrom(i, loadingNew) {
    var count = parseInt(await bitcoin.getBlockCount());
    var blockHash = await bitcoin.getBlockHash(i);
    var block = await bitcoin.getBlock(blockHash);
    var test;
    do {
        process.stdout.cursorTo(0);
        i++;
        var msg = "Block " + i + " of " + count;
        process.stdout.clearLine();
        process.stdout.write(msg);
        var newCount = parseInt(await bitcoin.getBlockCount());
        if (!loadingNew && newCount > count) {
            await loadFrom(count, true);
            count = newCount;
        }
        block = await bitcoin.getBlock(block.nextblockhash);
        for (var j = 0; j < block.tx.length; j++) {
            test = await handleTransaction(block.tx[j]);
        }
        if (!loadingNew) fs.writeFile('height', '' + i, (err) => { });
    } while (block.nextblockhash);
}

app.post('/tx', async (req, res) => {
    try {
        console.log(new Date().toLocaleTimeString() + " Broadcasting tx");
        var txid = await bitcoin.sendRawTransaction(req.body.tx);
        await handleTransaction(txid);
        res.status(200).send(txid);
    } catch(ex) {
        console.log(ex);
        res.sendStatus(500);
    }
});

app.route('/unspent/:address').get(async (req, res) => {
    try {
   //     console.log(new Date().toLocaleTimeString() + " " + req.params.address);
        res.status(200).send(JSON.stringify(await get(req.params.address)));
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.route('/pool').get(async (req, res) => {
   try {
        res.send(JSON.stringify(mempool));       
   } catch(e) {
       console.log(e);
       res.sendStatus(500);
   }   
});

app.route('/unspent').post(async (req, res) => {
    try {
     //   console.log(new Date().toLocaleTimeString() + " " + JSON.stringify(req.body));
        var data = [];
        for(var i = 0; i < req.body.length; i++) {
            data.push(await get(req.body[i]));
        }
        res.status(200).send(JSON.stringify(data)); 
    } catch (e) {
       console.log(e); 
       res.sendStatus(500);
    }
});

async function indexNewBlocks() {
   var indexedHeight = await getIndexedHeight();
   var currentHeight = await bitcoin.getBlockCount();
   checkMempool();
//   console.log("Indexed: " + indexedHeight + " Current: " + currentHeight + "\r");
   if(indexedHeight < currentHeight) {
        await loadFrom(indexedHeight);
   }
   setTimeout(indexNewBlocks, 15000);
}

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);

console.log('Server Started');
indexNewBlocks();