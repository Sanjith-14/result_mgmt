const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // console.log("Verified token")
    // next()
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)


    try{
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET.toString())
        // console.log(decoded);
        req.user = decoded;
        next()
    }
    catch(error){
        console.log(error) 
        return res.sendStatus(401)  //403..
    }
    
    // const decoded = jwt.verify(token, process.env.TOKEN_SECRET.toString(), (err, email,user) => {
    //     console.log(err)

    //     if (err) return res.sendStatus(403)

    //     console.log(email);
    //     console.log(user);
    //     req.email = email
    //     req.user = user
        
    //     next()
    // })
}

module.exports = verifyToken;