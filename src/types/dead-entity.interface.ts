import { SearchableEntities } from "./searchable-entities.type.js"

export interface DeadEntity {
    entity: SearchableEntities
    name: string
    line: number
    column: number
}