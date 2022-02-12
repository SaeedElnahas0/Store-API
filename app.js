require('dotenv').config();
require('express-async-errors')
const express = require('express');
const app = express();
const cors = require('cors');

const notFound = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');
const connectDB = require('./db/connect')
const productsRouter = require('./routes/products')
//middleware
app.use(cors());
app.use(express.json());

//routes
app.get('/', (req,res)=>{
    res.send('saeed...')
})
app.use('/api/v1/products', productsRouter)
//product routes
app.use(notFound)
app.use(errorMiddleware)

const port = process.env.PORT || 3000
const start = async () =>{
    try {
        //connect to db
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening port ${port} ...`))
    } catch (error) {
        console.log(error)
    }
}
start()



