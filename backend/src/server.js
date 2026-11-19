require('dotenv').config({ quiet: true });

const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
