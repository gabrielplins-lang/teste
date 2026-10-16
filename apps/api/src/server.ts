import { env } from "./config/env";
import { createApp } from "./app";

createApp().listen(env.PORT, () => {
  console.log(`API da Feijuca da Lu rodando em http://localhost:${env.PORT}`);
});
