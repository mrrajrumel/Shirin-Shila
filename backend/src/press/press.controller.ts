import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PressService } from './press.service';
@Controller('press') export class PressController { constructor(private readonly service:PressService){} @Get() list(@Query('all') all?:string){return this.service.list(all!=='true');} // Protect all mutation routes with your chosen auth guard before production deployment.
@Post() create(@Body() body:any){return this.service.create(body);} @Patch(':id') update(@Param('id') id:string,@Body() body:any){return this.service.update(id,body);} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id);} }
