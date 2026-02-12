const express = require('express');
const { dal } = require('./dal');
const app = express();
const port = 3000 || process.env.PORT;
const { Kafka } = require('kafkajs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


const kafkaClient = new Kafka({
    clientId: 'game-exchanger-api',
    brokers: ['kafka:9092']
});

const producer = kafkaClient.producer();

await producer.connect();
await producer.send({
    topic: 'status',
    messages: [
        { value: 'Game Exchanger API is up and running!' }
    ]
});

//Game Routes

app.post('/games', (req, res) => {

    const newGame = {
        Name: req.body.Name,
        Publisher: req.body.Publisher,
        ReleaseYear: req.body.ReleaseYear,
        System: req.body.System,
        Condition: req.body.Condition
    }

    dal.addGame(newGame);

    res.status(201).send('Added a new game');
});

app.get('/games', (req, res) => {

    const games = dal.getAllGames();

    res.status(200).send(games);
});

app.patch('/games/:id', (req, res) => {

    const updateData = {
        Name: req.body.Name,
        Publisher: req.body.Publisher,
        ReleaseYear: req.body.ReleaseYear,
        System: req.body.System,
        Condition: req.body.Condition,
        ownerId: req.body.ownerId
    }

    dal.updateGame(req.params.id, updateData);

    res.status(200).send(`Updated game with ID ${req.params.id}`);
});

app.put('/games/:id', (req, res) => {

    const newGameData = {
        Name: req.body.Name,
        Publisher: req.body.Publisher,
        ReleaseYear: req.body.ReleaseYear,
        System: req.body.System,
        Condition: req.body.Condition,
        ownerId: req.body.ownerId
    }

    dal.replaceGame(req.params.id, newGameData);

    res.status(200).send(`Replaced game with ID ${req.params.id}`);
});

app.delete('/games/:id', (req, res) => {

    dal.deleteGame(req.params.id);

    res.status(200).send(`Deleted game with ID ${req.params.id}`);
});

//User Routes

app.post('/users', (req, res) => {

    const newUser = {
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
        Address: req.body.Address
    }

    dal.addUser(newUser);

    res.status(201).send('Added a new user');
});

app.get('/users', (req, res) => {

    const users = dal.getAllUsers();

    res.status(200).send(users);
});

app.patch('/users/:id', (req, res) => {
    const updateData = {
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
        Address: req.body.Address
    }

    dal.updateUser(req.params.id, updateData);

    producer.send({
        topic: 'user-updates',
        messages: [
            { value: `User with ID ${req.params.id} has been updated.` }
        ]
    });

    res.status(200).send(`Updated user with ID ${req.params.id}`);
});

app.put('/users/:id', (req, res) => {
    const newUserData = {
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
        Address: req.body.Address
    }

    dal.replaceUser(req.params.id, newUserData);

    res.status(200).send(`Replaced user with ID ${req.params.id}`);
});

app.delete('/users/:id', (req, res) => {

    dal.deleteUser(req.params.id);

    res.status(200).send(`Deleted user with ID ${req.params.id}`);
});

//Exchange Routes
app.post('/exchanges', (req, res) => {

    const newExchange = {
        GameID: req.body.GameID,
        FromUserID: req.body.FromUserID,
        ToUserID: req.body.ToUserID,
        ExchangeDate: req.body.ExchangeDate,
        Status: req.body.Status
    }

    dal.addExchange(newExchange);

    producer.send({
        topic: 'exchange-updates',
        messages: [
            { value: `New exchange created between user ${newExchange.FromUserID} and user ${newExchange.ToUserID} for game ${newExchange.GameID}.` }
        ]
    });

    res.status(201).send('Added a new exchange');
});

app.get('/exchanges', (req, res) => {

    const exchanges = dal.getAllExchanges();

    res.status(200).send(exchanges);
});

app.patch('/exchanges/:id', (req, res) => {

    const updateData = {
        GameID: req.body.GameID,
        FromUserID: req.body.FromUserID,
        ToUserID: req.body.ToUserID,
        ExchangeDate: req.body.ExchangeDate,
        Status: req.body.Status
    }

    if (updateData.Status === 'Accepted') {
        producer.send({
            topic: 'exchange-updates',
            messages: [
                { value: `Exchange with ID ${req.params.id} has been accepted.` }
            ]
        });
    } else if (updateData.Status === 'Rejected') {
        producer.send({
            topic: 'exchange-updates',
            messages: [
                { value: `Exchange with ID ${req.params.id} has been rejected.` }
            ]
        });
    }

    dal.updateExchange(req.params.id, updateData);
    res.status(200).send(`Updated exchange with ID ${req.params.id}`);
});