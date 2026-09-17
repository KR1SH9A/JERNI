"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateJourneyDto = exports.AddTaskDto = exports.CreateJourneyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateJourneyDto {
    title;
    description;
    tags;
    visibility;
}
exports.CreateJourneyDto = CreateJourneyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Web Dev Journey' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateJourneyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'A curated path to learn modern web development.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateJourneyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['typescript', 'react'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateJourneyDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PUBLIC', 'PRIVATE']),
    __metadata("design:type", String)
], CreateJourneyDto.prototype, "visibility", void 0);
class AddTaskDto {
    title;
    kind;
    recurrenceRule;
}
exports.AddTaskDto = AddTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Practice TypeScript for 1 hour' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AddTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['MILESTONE', 'RECURRING'] }),
    (0, class_validator_1.IsEnum)(['MILESTONE', 'RECURRING']),
    __metadata("design:type", String)
], AddTaskDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['DAILY'], description: 'Required when kind=RECURRING' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DAILY']),
    __metadata("design:type", String)
], AddTaskDto.prototype, "recurrenceRule", void 0);
class UpdateJourneyDto {
    title;
    description;
    tags;
    visibility;
}
exports.UpdateJourneyDto = UpdateJourneyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Journey Title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateJourneyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateJourneyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['react', 'typescript'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateJourneyDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PUBLIC', 'PRIVATE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PUBLIC', 'PRIVATE']),
    __metadata("design:type", String)
], UpdateJourneyDto.prototype, "visibility", void 0);
//# sourceMappingURL=curation.dto.js.map