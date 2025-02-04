const http = require('http'),
fs = require('fs'),
url = require('url');

http.createServer((request, response) => {
    let addr = request.url,
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

    fs.appendFile('log.txt', 'URL:' + addr + '\nTimestamp:' + new Date() + '\n\n', (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.error("Error reading file:", error);
            response.writeHead(500,{'Content_Type': 'text/plain'});
            response.ent("Internal Server Error");
            return;
        }

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(data);
    response.end();

}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
});