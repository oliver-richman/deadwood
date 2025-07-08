import { SearchableEntities } from './types/searchable-entities.type.js';

export function joinWithAnd(items: Array<string | { toString(): string }>): string {
  const stringItems = items.map((item) => item.toString());
  if (stringItems.length === 0) return '';
  if (stringItems.length === 1) return stringItems[0];
  if (stringItems.length === 2) return `${stringItems[0]} and ${stringItems[1]}`;

  const allButLast = stringItems.slice(0, -1).join(', ');
  const last = stringItems[stringItems.length - 1];
  return `${allButLast}, and ${last}`;
}

export function getNiceEntityType(entity: SearchableEntities, singular: boolean) {
  switch (entity) {
    case SearchableEntities.VARIABLES:
      return singular ? 'variable' : 'variables';
    case SearchableEntities.FUNCTIONS:
      return singular ? 'function' : 'functions';
    case SearchableEntities.METHODS:
      return singular ? 'class method' : 'class methods';
    case SearchableEntities.CONSTRUCTOR_PARAMS:
      return singular ? 'class constructor parameter' : 'class constructor parameters';
    case SearchableEntities.IMPORTS:
      return singular ? 'import' : 'imports';
  }
}
