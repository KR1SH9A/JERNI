export declare class CreateJourneyDto {
    title: string;
    description?: string;
    tags?: string[];
    visibility?: 'PUBLIC' | 'PRIVATE';
}
export declare class AddTaskDto {
    title: string;
    kind: 'MILESTONE' | 'RECURRING';
    recurrenceRule?: 'DAILY';
}
export declare class UpdateJourneyDto {
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: 'PUBLIC' | 'PRIVATE';
}
//# sourceMappingURL=curation.dto.d.ts.map