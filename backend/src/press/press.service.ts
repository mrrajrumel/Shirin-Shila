import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable() export class PressService { constructor(private prisma:PrismaService){} list(publishedOnly=true){return this.prisma.pressCoverage.findMany({where:publishedOnly?{published:true}:undefined,orderBy:[{sortOrder:'asc'},{createdAt:'desc'}]});} create(data:any){return this.prisma.pressCoverage.create({data});} update(id:string,data:any){return this.prisma.pressCoverage.update({where:{id},data});} remove(id:string){return this.prisma.pressCoverage.delete({where:{id}});} }
