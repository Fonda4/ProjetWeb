import { app } from "./app";

console.log('Starting the server at ' + new Date().toISOString());

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})
