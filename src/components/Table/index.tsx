export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  className?: string;
  sortValue?: (item: T) => string | number | Date;
}

export * from './Table'; 