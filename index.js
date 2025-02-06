const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Serve index.html by default
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        res.writeHead(200);
        res.end(content);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 