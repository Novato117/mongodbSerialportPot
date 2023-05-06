const SerialPort = require('serialport').SerialPort;
const { DelimiterParser } = require('@serialport/parser-delimiter');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
//constructing a serialport objetc inmmediately opens a port
const puerto = new SerialPort({
    path: 'COM4', //path to serial port
    baudRate: 9600
});
const parser = puerto.pipe(new DelimiterParser({ delimiter: '\n' }));
//connection server
mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log('conectado!!')).catch(error => console.log(error));
//model schema
const userSchema = new mongoose.Schema({
    temperature: Number,
    timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('User', userSchema);


/*parser.on('open', function () {
    console.log('Conexion abierta');
});*/

parser.on('data', function (data) {
    var enc = new TextDecoder();
    var arr = new Uint8Array(data);
    ready = enc.decode(arr)
    //console.log('Data;', data);
    console.log(ready)
})
puerto.on('error', function (err) {
    console.log(err);
});

/*parser.on('data', (data) => {
    const readings = JSON.parse(data);
    app.get('/sensor', (req, res) => {
        const sensorData = new SensorData({ readings });
        sensorData.save().then(() => res.send('Sensor data added to database'))
            .catch(err => console.error('Error saving sensor data to database:', err));
    });
});*/
app.get('/', (req, res) => {
    SensorData.find()
        .then(SensorData => res.json(SensorData))
        .catch(error => res.json(error))
});
app.get('/temperatura', (req, res) => {
    puerto.write('read_temperature\n');
    parser.on('data', function (data) {
        var enc = new TextDecoder();
        var arr = new Uint8Array(data);
        ready = enc.decode(arr)
        res.json({ ready });
    })
})
app.post('/temperatura', (req, res) => {
    const body = req.body;
    const sensorData = new SensorData(body)
    sensorData.save();
    res.json({
        mensage: "user guardado....",
        user
    })
})
app.listen(5000, () => {
    console.log(`Server listening at http://localhost:${5000}`)
})