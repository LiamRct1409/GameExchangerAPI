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

async function startKafkaProducer() {
    await producer.connect();
    console.log('Kafka Producer connected');
}

startKafkaProducer().catch(console.error);


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
    try {
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
                { value: JSON.stringify({
                    type: 'user-update',
                    value: updateData.Email
                }) }
            ]
        });
        
        res.status(200).send(`Updated user with ID ${req.params.id}`);

    } catch (error) {
        console.error("Error updating user:", error);
    }

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

    try {

        const newExchange = {
            GameID: req.body.GameID,
            FromUserEmail: req.body.FromUserEmail,
            ToUserEmail: req.body.ToUserEmail,
            ExchangeDate: req.body.ExchangeDate,
            Status: req.body.Status
        }

        dal.addExchange(newExchange);

        producer.send({
            topic: 'exchange-updates',
            messages: [
                { 
                    key: `exchange-${newExchange.FromUserEmail}-${newExchange.ToUserEmail}`, 
                    value: JSON.stringify({
                        type: "exchange-created",
                        fromEmail: newExchange.FromUserEmail,
                        toEmail: newExchange.ToUserEmail,
                        gameId: newExchange.GameID
                    })
                }
            ]
        });


        res.status(201).send('Added a new exchange');

    } catch (error) {
        console.error("Error adding exchange:", error);
    }

    
});

app.get('/exchanges', (req, res) => {

    const exchanges = dal.getAllExchanges();

    res.status(200).send(exchanges);
});

app.patch('/exchanges/:id', async (req, res) => {

    try {
        const updateData = {
            GameID: req.body.GameID,
            FromUserEmail: req.body.FromUserEmail,
            ToUserEmail: req.body.ToUserEmail,
            ExchangeDate: req.body.ExchangeDate,
            Status: req.body.Status
        }

        if (updateData.Status === 'Accepted') {

            await producer.send({
                topic: 'exchange-updates',
                messages: [
                    {
                        value: JSON.stringify({
                            type: 'exchange-status',
                            status: 'accepted',
                            fromEmail: updateData.FromUserEmail,
                            toEmail: updateData.ToUserEmail
                        })
                    }
                ]
            });

        } else if (updateData.Status === 'Rejected') {

            await producer.send({
                topic: 'exchange-updates',
                messages: [
                    {
                        value: JSON.stringify({
                            type: 'exchange-status',
                            status: 'rejected',
                            fromEmail: updateData.FromUserEmail,
                            toEmail: updateData.ToUserEmail
                        })
                    }
                ]
            });

        }

        dal.updateExchange(req.params.id, updateData);

        res.status(200).send(`Updated exchange with ID ${req.params.id}`);

    } catch (error) {
        console.error("Error updating exchange:", error);
    }
});