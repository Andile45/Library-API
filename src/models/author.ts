export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export const authors: Author[] = [];
export let nextAuthorId = 1;
