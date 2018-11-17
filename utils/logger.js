module.exports = {
    log: function(title, msg) {
        console.log(`[ ${title} ] > ${msg}`);
    },
    info: function(msg) {
        console.log(`[ INFO ] > ${msg}`);
    },
    warn: function(msg) {
        console.log(`[ WARNNING ] > ${msg}`);
    },
    error: function(msg) {
        console.log(`[ ERROR ] > ${msg}`);
    }
}