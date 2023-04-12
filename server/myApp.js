const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path: './secrets.env'})
const cors = require('cors');
const app = express();
const PORT = 4000;
const { Vonage } = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: "8c6371f3",
  apiSecret: "pNVSmMn49Ij34Qq5"
});
const generateCode = () => Math.random().toString(36).substring(2, 12);

const sendNovuNotification = async (recipient, verificationCode) => {
    try {
        let response = await vonage.trigger("verify-4IRb3FBk8", {
            to: {
                subscriberId: recipient,
                phone: recipient,
            },
            payload: {
                code: verificationCode,
            },
        });
        console.log(response);
    } catch (err) {
        console.error(err);
    }
};
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Hello World"})
})
const users = [];


const generateID = () => Math.random().toString(36).substring(2, 10);

app.post("/api/register", (req, res) => {
    
    const { email, password, tel, username } = req.body;

    
    let result = users.filter((user) => user.email === email || user.tel === tel);

    
    if (result.length === 0) {
       
        const newUser = { id: generateID(), email, password, username, tel };
        
        users.push(newUser);
        
        return res.json({
            message: "Account created successfully!",
        });
    }
    
    res.json({
        error_message: "User already exists",
    });
});
app.post("/api/login", (req, res) => {
    let code;
    const { email, password } = req.body;
    let result = users.filter(
        (user) => user.email === email && user.password === password
    );


    if (result.length !== 1) {
        return res.json({
            error_message: "Incorrect credentials",
        });
    }
    res.json({
        message: "Login successfully",
        data: {
            username: result[0].username,
        },
    });
    code = generateCode();

    sendNovuNotification(result[0].tel, code)
    res.json({
        message: "Login successfull",
        data: {username: result[0].username}
    })
});

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`)
})