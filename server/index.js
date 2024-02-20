const {client, createTables, createUser, createProduct, fetchUsers, fetchProducts, createFavorite, fetchFavorites, destroyFavorite, fetchAllUserFavorites} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async(req, res, next)=> {
    try {
        res.send(await fetchUsers());
    }
    catch(ex) {
        next(ex);
    }
});

app.get('/api/products', async(req, res, next)=> {
    try {
        res.send(await fetchProducts());
    }
    catch(ex) {
        next(ex);
    }
});

app.get('/api/users/:id/favorites', async(req, res, next)=> {
    try {
        res.send(await fetchFavorites(req.params.id));
    }
    catch(ex) {
        next(ex);
    }
});

app.post('/api/users/:id/favorites', async(req, res, next)=> {
    try {
        res.status(201).send(await createFavorite({
            user_id: req.params.user_id, 
            product_id: req.body.product_id
        }));
    }
    catch(ex) {
        next(ex);
    }
});

app.delete('/api/users/:userId/favorites/:id', async(req, res, next)=> {
    try {
        await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
        res.sendStatus(204);
    }
    catch(ex) {
        next(ex);
    }
});


const init = async()=> {
    console.log('connecting to database');
    client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    console.log('user and product created');
    const [joe, sara, tom, computer, book, bag] = await Promise.all([
        createUser({ username: 'joe', password: 'hello'}),
        createUser({ username: 'sara', password: 'hi'}),
        createUser({ username: 'tom', password: 'yo'}),
        createProduct({ name: 'computer'}),
        createProduct({ name: 'book'}),
        createProduct({ name: 'bag'}),
    ]);
    const users = await fetchUsers();
    const products = await fetchProducts();
    let favorite = await createFavorite({
        product_id: book.id,
        user_id: sara.id
    });
    favorite = await Promise.all([
        createFavorite({ user_id: joe.id, product_id: computer.id}),
        createFavorite({ user_id: tom.id, product_id: bag.id})
    ]);
    
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log(`curl localhost:${port}/api/users`);
        console.log(`curl localhost:${port}/api/products`);
        console.log(`curl localhost:${port}/api/users/${sara.id}/favorites`);
        console.log(`curl -X DELETE localhost:${port}/api/users/${sara.id}/favorites/${favorite.id}`);
        console.log(`curl localhost:${port}/api/users/${joe.id}/favorites`);
        console.log(`curl -X POST localhost:${port}/api/users/${joe.id}/favorites -d '{"product_id": "${computer.id}"}' -H "Content-Type:application/json" `);
    });
    
};

init();