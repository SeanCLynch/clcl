const Redis = require('ioredis');
let redis = new Redis();

redis.del('sean:mylist');
redis.rpush('sean:mylist', "ITEM #1");
redis.rpush('sean:mylist', "ITEM #2");
redis.rpush('sean:mylist', "ITEM #3");
redis.rpush('sean:mylist', "ITEM #4");

redis.del('sean:otherlist');
redis.rpush('sean:otherlist', "ITEM A");
redis.rpush('sean:otherlist', "ITEM B");
redis.rpush('sean:otherlist', "ITEM C");

redis.ping(function (err, result) {
    if (err) console.log("Error loading seeds!");
    if (result) console.log("Success loading seeds!");
    process.exit();
});
