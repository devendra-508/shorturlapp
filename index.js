const express = require("express");

const {connectToMongoDB} = require('./connect')

const urlRoute =  require('./routes/url');
const URL = require('./models/url')
const app = express();
app.use(express.json());


const PORT = 800;

connectToMongoDB('mongodb://localhost:27017/shortlink')
.then(() => console.log('mongodb connected'))
.catch((err) => console.log('mongodb connection err:', err));



app.use('/url', urlRoute);

app.get('/:shortId', async(req,res)=>{
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
    {
        shortid: shortId
    },
    {
        $push:{
          visitHistory: {
           timestamp: Date.now(),
          },
        },
    }
  );
  res.redirect(entry.redirectURL);


});



app.listen(PORT, ()=> console.log(`sever start at PORT:${PORT}`))