/* In real world use cases, the policy class and the handler class may
 * be put it different files. Here, we're putting them in a single file
 * for simplicity. 
 */

import { Injectable } from "@nestjs/common";
import { Policy } from "./interfaces/policy.interface";
import { PolicyHandler } from "./interfaces/policy-handler.interface";
import { ActiveUserData } from "src/iam/interfaces/active-user-data.interface";
import { PolicyHandlerStorage } from "./policy-handler.storage";

export class ValidUserPolicy implements Policy {
    name = "ValidUser";
}

@Injectable()
export class ValidUserPolicyHandler implements PolicyHandler<ValidUserPolicy> {

    constructor(private readonly policyHandlerStorage: PolicyHandlerStorage) {
        this.policyHandlerStorage.add(ValidUserPolicy, this);
    }

    async handle(policy: ValidUserPolicy, user: ActiveUserData): Promise<void> {
        const isValid = user.email.endsWith("@company.com");
        
        if(!isValid) {
            throw new Error("The user is not valid.");
        }
    }
}