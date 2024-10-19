import { repl } from "@nestjs/core";
import { AppModule } from "./app.module";

/*
    Putting this file in src will enable NestJS REPL, a development feature that
    will allow us to interact with nestjs objects from the terminal. Sometimes, it
    can be a handy development tool.

    To run NestJS in REPL mode, use the following command:
    npm run start -- --entryFile REPL
*/

async function bootstrap() {
    await repl(AppModule);
}

bootstrap();