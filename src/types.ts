export interface TIL {
  ulid: string;
  title: string;
  content: string;
  tags: string[];
}

// 分页相关类型
export class Page {
  static readonly ITEMS_PER_PAGE = 10;

  constructor(
    public readonly tils: TIL[],
    public readonly pageNumber: number
  ) {}

  static fromAllTILs(allTils: TIL[], pageNumber: number): Page {
    const start = (pageNumber - 1) * Page.ITEMS_PER_PAGE;
    const tils = allTils.slice(start, start + Page.ITEMS_PER_PAGE);
    return new Page(tils, pageNumber);
  }

  static getTotalPages(totalTils: number): number {
    return Math.ceil(totalTils / Page.ITEMS_PER_PAGE);
  }
}