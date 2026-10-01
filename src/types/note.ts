export interface Note {
  id?: string;
  body?: string;
  account?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SortOption = 'created-desc' | 'created-asc' | 'updated-desc' | 'updated-asc';
