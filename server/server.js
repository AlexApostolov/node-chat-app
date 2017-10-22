// Use Node.js built-in module "path" to build cleaner paths between "server" & "public" directories
const path = require('path');
const publicPath = path.join(__dirname, '../public');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
