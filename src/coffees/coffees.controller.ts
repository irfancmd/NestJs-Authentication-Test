import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { Permission } from 'src/iam/authorization/permission.type';
import { Permissions } from 'src/iam/authorization/decorators/permissions.decorator';
import { Policies } from 'src/iam/authorization/decorators/policies.decotator';
import { ValidUserPolicy } from 'src/iam/authorization/policies/valid-user.policy';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  // ActiveUser is our custom decorator
  @Get()
  findAll(@ActiveUser() user: ActiveUserData) {
    console.log(user);

    return this.coffeesService.findAll();
  }

  // Our custom decorator for role based authorization
  @Roles(Role.Admin)
  // Instead of using role baesd authentication, we could intead go with claim based authorization like this
  // @Permissions(Permission.CreateCoffee)
  // We can use policy based authorization as well
  // @Policies(new ValidUserPolicy(), ...other_policies)
  @Get('test-role')
  testRole(@Param('id') id: string) {
    return "Role based authorization works!";
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(+id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(+id);
  }
}
