import { app } from "./app.js";
import { env } from "./config/env.js";

const port = Number.parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
