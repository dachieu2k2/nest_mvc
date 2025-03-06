import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.use(cookieParser());

  // Register partials directory
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  // Register partials directory
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
