/* This file is created for demonstrating policy baed
   authorization system. Both role and claims based authorization
   fall under policy in some way, but policy based authorization is
   used for advanced use cases, where more granular control is required.
*/
export interface Policy {
    name: string;
}