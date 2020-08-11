const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

// Create new user: sean sean@sean.com password
redis.del('auth:sean@sean.com');
redis.hset('auth:sean@sean.com', "password", 'password', "namekey", 'users:sean');
redis.del('users:sean');
redis.hset('users:sean', "email", 'sean@sean.com');

// Give that user two lists.
redis.del('list:sean:mylist');
redis.rpush('list:sean:mylist', "ITEM #1");
redis.rpush('list:sean:mylist', "ITEM #2");
redis.rpush('list:sean:mylist', "ITEM #3");
redis.rpush('list:sean:mylist', "ITEM #4");

redis.del('list:sean:otherlist');
redis.rpush('list:sean:otherlist', "ITEM A");
redis.rpush('list:sean:otherlist', "ITEM B");
redis.rpush('list:sean:otherlist', "ITEM C");

redis.ping(function (err, result) {
    if (err) console.log("Error loading seeds!");
    if (result) console.log("Success loading seeds!");
    process.exit();
});
