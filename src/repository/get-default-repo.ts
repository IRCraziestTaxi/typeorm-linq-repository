import { RepositoryBase, RepositoryOptions } from 'typeorm-linq-repository';

export function getDefaultRepo<T>(modelClass: { new (): T }, opts?: RepositoryOptions) {
  return new class extends RepositoryBase<T> {
    public constructor() {
      super(modelClass, opts);
    }
  }();
}
