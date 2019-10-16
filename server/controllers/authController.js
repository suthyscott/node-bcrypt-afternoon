const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body
        const db = req.app.get('db')
        const {session} = req

        let result = await db.get_user(username); 
        existingUser = result[0] 
        if(existingUser){
            res.status(409).send('Username taken')
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)        

        let registeredUser = await db.register_user(isAdmin, username, hash)
        let user = registeredUser[0]

        session.user = {isAdmin: user.is_admin, id: user.id, username: user.username}
        res.status(201).send(session.user)
    },

    login: async (req, res) => {
        const {username, password} = req.body
        const db = req.app.get('db')
        const {session} = req

        const foundUser = await db.get_user(username)
        const user = foundUser[0]

        if(!user){
            res.status(401).send('User not found. Please register as a new user before logging in.')
        }
        const isAuthenticated = bcrypt.compareSync(password, user.hash)
        if(!isAuthenticated){
            res.status(403).send('Incorrect password')
        }
        
        session.user = {isAdmin: user.is_admin, id: user.id, username: user.username}
        return res.status(201).send(session.user)
    },

    logout: async (req, res)=> {
        req.session.destroy()
        res.sendStatus(200)
    }
}