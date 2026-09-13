import { MembershipRepository } from '../ports/membership.repository';
export interface MembershipStatusResult {
    isMember: boolean;
}
export declare class GetMembershipStatusQuery {
    private readonly membershipRepo;
    constructor(membershipRepo: MembershipRepository);
    execute(journeyId: string, userId: string): Promise<MembershipStatusResult>;
}
//# sourceMappingURL=participation.queries.d.ts.map