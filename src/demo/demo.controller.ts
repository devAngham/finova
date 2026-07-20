import { Controller, Post, Get } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private demoService: DemoService) {}

  @Post('reset')
  reset() {
    return this.demoService.resetDemo();
  }

  @Get('credentials')
  credentials() {
    return this.demoService.getDemoCredentials();
  }
}
