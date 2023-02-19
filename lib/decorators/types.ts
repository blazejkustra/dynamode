export interface PrefixSuffixOptions {
  prefix?: string;
  suffix?: string;
}

export interface IndexDecoratorOptions {
  indexName: string;
}

export interface DateDecoratorOptions {
  as?: 'createdAt' | 'updatedAt';
}
