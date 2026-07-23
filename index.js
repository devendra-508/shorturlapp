const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const {connectToMongoDB} = require('./connect')
const {restrictToLoggedingUserOnly, checkAuth } = require('./middlewares/auth');

const URL = require('./models/url');


const urlRoute =  require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRouter = require('./routes/user');

const app = express();
const PORT = 800;

connectToMongoDB('mongodb://localhost:27017/shortlink')
.then(() => console.log('mongodb connected'))
.catch((err) => console.log('mongodb connection err:', err));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());//support json data
app.use(express.urlencoded({extended: false}));//support form data
app.use(cookieParser());//support form data

app.use('/url', restrictToLoggedingUserOnly, urlRoute);
app.use('/user', userRouter);
app.use('/',checkAuth, staticRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    // console.log('Searching for shortId:', JSON.stringify(shortId));//

    try {
        const entry = await URL.findOneAndUpdate(
            { shortid: shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            }
        );

        if (!entry) {
            return res.status(404).send('Short URL not found');
        }

        return res.redirect(entry.redirectURL);
    } catch (err) {
        return res.status(500).send('Something went wrong');
    }
});


app.listen(PORT, ()=> console.log(`sever start at PORT:${PORT}`))
