/**
 * This file is created for demonstrating Claim Based Authorization.
 * Claims allow us to provide more granular permission control compared
 * to roles. For instance, specific permission for a super admin, but not
 * other admins.
 */

export enum CoffeesPermission {
    CreateCoffee = 'create_coffee',
    UpdateCoffee = 'update_coffee',
    DeleteCoffee = 'delete_coffee',
}