export interface TocItem {
  label: string;
  href: string;
  children?: TocItem[];
}
