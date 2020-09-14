
const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

// Taken from website console magic. TODO: check no double words. 
const redis_blacklist = [ "acl", "load", "save", "list", "users", "getuser", "setuser", "deluser", "cat", "genpass", "whoami", "log", "help", "append", "auth", "bgrewriteaof", "bgsave", "bitcount", "bitfield", "bitop", "bitpos", "blpop", "brpop", "brpoplpush", "bzpopmin", "bzpopmax", "client", "caching", "id", "kill", "list", "getname", "getredir", "pause", "reply", "setname", "tracking", "unblock", "cluster", "addslots", "bumpepoch", "count-failure-reports", "countkeysinslot", "delslots", "failover", "flushslots", "forget", "getkeysinslot", "info", "keyslot", "meet", "myid", "nodes", "replicate", "reset", "saveconfig", "set-config-epoch", "setslot", "slaves", "replicas", "slots", "command", "count", "command getkeys", "command info", "config get", "config rewrite", "config set", "config resetstat", "dbsize", "debug object", "debug segfault", "decr", "decrby", "del", "discard", "dump", "echo", "eval", "evalsha", "exec", "exists", "expire", "expireat", "flushall", "flushdb", "geoadd", "geohash", "geopos", "geodist", "georadius", "georadiusbymember", "get", "getbit", "getrange", "getset", "hdel", "hello", "hexists", "hget", "hgetall", "hincrby", "hincrbyfloat", "hkeys", "hlen", "hmget", "hmset", "hset", "hsetnx", "hstrlen", "hvals", "incr", "incrby", "incrbyfloat", "info", "lolwut", "keys", "lastsave", "lindex", "linsert", "llen", "lpop", "lpos", "lpush", "lpushx", "lrange", "lrem", "lset", "ltrim", "memory doctor", "memory help", "memory malloc-stats", "memory purge", "memory stats", "memory usage", "mget", "migrate", "module list", "module load", "module unload", "monitor", "move", "mset", "msetnx", "multi", "object", "persist", "pexpire", "pexpireat", "pfadd", "pfcount", "pfmerge", "ping", "psetex", "psubscribe", "pubsub", "pttl", "publish", "punsubscribe", "quit", "randomkey", "readonly", "readwrite", "rename", "renamenx", "restore", "role", "rpop", "rpoplpush", "rpush", "rpushx", "sadd", "save", "scard", "script debug", "script exists", "script flush", "script kill", "script load", "sdiff", "sdiffstore", "select", "set", "setbit", "setex", "setnx", "setrange", "shutdown", "sinter", "sinterstore", "sismember", "slaveof", "replicaof", "slowlog", "smembers", "smove", "sort", "spop", "srandmember", "srem", "stralgo", "strlen", "subscribe", "sunion", "sunionstore", "swapdb", "sync", "psync", "time", "touch", "ttl", "type", "unsubscribe", "unlink", "unwatch", "wait", "watch", "zadd", "zcard", "zcount", "zincrby", "zinterstore", "zlexcount", "zpopmax", "zpopmin", "zrange", "zrangebylex", "zrevrangebylex", "zrangebyscore", "zrank", "zrem", "zremrangebylex", "zremrangebyrank", "zremrangebyscore", "zrevrange", "zrevrangebyscore", "zrevrank", "zscore", "zunionstore", "scan", "sscan", "hscan", "zscan", "xinfo", "xadd", "xtrim", "xdel", "xrange", "xrevrange", "xlen", "xread", "xgroup", "xreadgroup", "xack", "xclaim", "xpending", "latency doctor", "latency graph", "latency history", "latency latest", "latency reset", "latency help" ]

// Taken from: https://github.com/marteinn/The-Big-Username-Blacklist
const big_blacklist =  ['.htaccess', '.htpasswd', '.well-known', '400', '401', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '421', '422', '423', '424', '426', '428', '429', '431', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '_domainkey', 'about', 'about-us', 'abuse', 'access', 'account', 'accounts', 'ad', 'add', 'admin', 'administration', 'administrator', 'ads', 'ads.txt', 'advertise', 'advertising', 'aes128-ctr', 'aes128-gcm', 'aes192-ctr', 'aes256-ctr', 'aes256-gcm', 'affiliate', 'affiliates', 'ajax', 'alert', 'alerts', 'alpha', 'amp', 'analytics', 'api', 'app', 'app-ads.txt', 'apps', 'asc', 'assets', 'atom', 'auth', 'authentication', 'authorize', 'autoconfig', 'autodiscover', 'avatar', 'backup', 'banner', 'banners', 'bbs', 'beta', 'billing', 'billings', 'blog', 'blogs', 'board', 'bookmark', 'bookmarks', 'broadcasthost', 'business', 'buy', 'cache', 'calendar', 'campaign', 'captcha', 'careers', 'cart', 'cas', 'categories', 'category', 'cdn', 'cgi', 'cgi-bin', 'chacha20-poly1305', 'change', 'channel', 'channels', 'chart', 'chat', 'checkout', 'clear', 'client', 'close', 'cloud', 'cms', 'com', 'comment', 'comments', 'community', 'compare', 'compose', 'config', 'connect', 'contact', 'contest', 'cookies', 'copy', 'copyright', 'count', 'cp', 'cpanel', 'create', 'crossdomain.xml', 'css', 'curve25519-sha256', 'customer', 'customers', 'customize', 'dashboard', 'db', 'deals', 'debug', 'delete', 'desc', 'destroy', 'dev', 'developer', 'developers', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'disconnect', 'discuss', 'dns', 'dns0', 'dns1', 'dns2', 'dns3', 'dns4', 'docs', 'documentation', 'domain', 'download', 'downloads', 'downvote', 'draft', 'drop', 'ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'edit', 'editor', 'email', 'enterprise', 'error', 'errors', 'event', 'events', 'example', 'exception', 'exit', 'explore', 'export', 'extensions', 'false', 'family', 'faq', 'faqs', 'favicon.ico', 'features', 'feed', 'feedback', 'feeds', 'file', 'files', 'filter', 'follow', 'follower', 'followers', 'following', 'fonts', 'forgot', 'forgot-password', 'forgotpassword', 'form', 'forms', 'forum', 'forums', 'friend', 'friends', 'ftp', 'get', 'git', 'go', 'graphql', 'group', 'groups', 'guest', 'guidelines', 'guides', 'head', 'header', 'help', 'hide', 'hmac-sha', 'hmac-sha1', 'hmac-sha1-etm', 'hmac-sha2-256', 'hmac-sha2-256-etm', 'hmac-sha2-512', 'hmac-sha2-512-etm', 'home', 'host', 'hosting', 'hostmaster', 'htpasswd', 'http', 'httpd', 'https', 'humans.txt', 'icons', 'images', 'imap', 'img', 'import', 'index', 'info', 'insert', 'investors', 'invitations', 'invite', 'invites', 'invoice', 'is', 'isatap', 'issues', 'it', 'jobs', 'join', 'js', 'json', 'keybase.txt', 'learn', 'legal', 'license', 'licensing', 'like', 'limit', 'live', 'load', 'local', 'localdomain', 'localhost', 'lock', 'login', 'logout', 'lost-password', 'm', 'mail', 'mail0', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mail6', 'mail7', 'mail8', 'mail9', 'mailer-daemon', 'mailerdaemon', 'map', 'marketing', 'marketplace', 'master', 'me', 'media', 'member', 'members', 'message', 'messages', 'metrics', 'mis', 'mobile', 'moderator', 'modify', 'more', 'mx', 'mx1', 'my', 'net', 'network', 'new', 'news', 'newsletter', 'newsletters', 'next', 'nil', 'no-reply', 'nobody', 'noc', 'none', 'noreply', 'notification', 'notifications', 'ns', 'ns0', 'ns1', 'ns2', 'ns3', 'ns4', 'ns5', 'ns6', 'ns7', 'ns8', 'ns9', 'null', 'oauth', 'oauth2', 'offer', 'offers', 'online', 'openid', 'order', 'orders', 'overview', 'owa', 'owner', 'page', 'pages', 'partners', 'passwd', 'password', 'pay', 'payment', 'payments', 'photo', 'photos', 'pixel', 'plans', 'plugins', 'policies', 'policy', 'pop', 'pop3', 'popular', 'portal', 'portfolio', 'post', 'postfix', 'postmaster', 'poweruser', 'preferences', 'premium', 'press', 'previous', 'pricing', 'print', 'privacy', 'privacy-policy', 'private', 'prod', 'product', 'production', 'profile', 'profiles', 'project', 'projects', 'public', 'purchase', 'put', 'quota', 'redirect', 'reduce', 'refund', 'refunds', 'register', 'registration', 'remove', 'replies', 'reply', 'report', 'request', 'request-password', 'reset', 'reset-password', 'response', 'return', 'returns', 'review', 'reviews', 'robots.txt', 'root', 'rootuser', 'rsa-sha2-2', 'rsa-sha2-512', 'rss', 'rules', 'sales', 'save', 'script', 'sdk', 'search', 'secure', 'security', 'select', 'services', 'session', 'sessions', 'settings', 'setup', 'share', 'shift', 'shop', 'signin', 'signup', 'site', 'sitemap', 'sites', 'smtp', 'sort', 'source', 'sql', 'ssh', 'ssh-rsa', 'ssl', 'ssladmin', 'ssladministrator', 'sslwebmaster', 'stage', 'staging', 'stat', 'static', 'statistics', 'stats', 'status', 'store', 'style', 'styles', 'stylesheet', 'stylesheets', 'subdomain', 'subscribe', 'sudo', 'super', 'superuser', 'support', 'survey', 'sync', 'sysadmin', 'system', 'tablet', 'tag', 'tags', 'team', 'telnet', 'terms', 'terms-of-use', 'test', 'testimonials', 'theme', 'themes', 'today', 'tools', 'topic', 'topics', 'tour', 'training', 'translate', 'translations', 'trending', 'trial', 'true', 'umac-128', 'umac-128-etm', 'umac-64', 'umac-64-etm', 'undefined', 'unfollow', 'unlike', 'unsubscribe', 'update', 'upgrade', 'usenet', 'user', 'username', 'users', 'uucp', 'var', 'verify', 'video', 'view', 'void', 'vote', 'vpn', 'webmail', 'webmaster', 'website', 'widget', 'widgets', 'wiki', 'wpad', 'write', 'www', 'www-data', 'www1', 'www2', 'www3', 'www4', 'you', 'yourname', 'yourusername', 'zlib'];

// Personal collection with checklist-specific items. 
const personal_blacklist = ['download', 'username', 'home', 'signup', 'login', 'dashboard', 'random', 'cl', 'checklist', 'list', 'tmp-forks', 'forks', 'tmp-fork'];

exports.validateUsername = async function (desired_username) {

    // disallow short usernames.
    if (desired_username.length < 4) return {
        'error': "Username must be > 3 characters long.",
        'valid': false
    }

    // disallow any time of whitespace.
    if (/\s/.test(desired_username)) return {
        'error': "Username cannot contain spaces.",
        'valid': false
    }

    // disallow from "big" blacklist. 
    if (big_blacklist.includes(desired_username)) return {
        'error': "Invalid username.",
        'valid': false
    }

    // disallow from "personal" blacklist. 
    if (personal_blacklist.includes(desired_username)) return {
        'error': "Invalid username.",
        'valid': false
    }

    // disallow from "redis" blacklist. 
    if (redis_blacklist.includes(desired_username)) return {
        'error': "Invalid username.",
        'valid': false
    }

    // disallow already taken. 
    let name_key = `users:${desired_username}`;
    let name_key_check = await redis.exists(name_key);
    if (name_key_check) return {
        'error': "Username already taken.",
        'valid': false
    }

    return {
        'valid': true
    }

}

exports.validateListname =  async function (username, desired_listname) {

    // disallow short usernames.
    if (desired_listname.length < 4) return {
        'error': "Listname must be > 3 characters long.",
        'valid': false
    }

    // disallow any time of whitespace.
    if (/\s/.test(desired_listname)) return {
        'error': "Listname cannot contain spaces.",
        'valid': false
    }

    // disallow from "big" blacklist. 
    if (big_blacklist.includes(desired_listname)) return {
        'error': "Invalid listname.",
        'valid': false
    }
    // disallow from "personal" blacklist. 
    if (personal_blacklist.includes(desired_listname)) return {
        'error': "Invalid listname.",
        'valid': false
    }

    // disallow from "redis" blacklist. 
    if (redis_blacklist.includes(desired_listname)) return {
        'error': "Invalid listname.",
        'valid': false
    }

    // disallow already taken. 
    let list_key = `list:${username}:${desired_listname}`;
    let list_key_check = await redis.exists(list_key);
    if (list_key_check) return {
        'error': "Listname already taken.",
        'valid': false
    }

    return {
        'valid': true
    }

}