declare module '@sap/cds' {
  interface SelectQuery {
    from(entity: any): SelectQuery;
    where(conditions: any): SelectQuery;
    columns(columns: any): SelectQuery;
    orderBy(fields: any): SelectQuery;
    groupBy(fields: any): SelectQuery;
    limit(limit: number): SelectQuery;
    offset(offset: number): SelectQuery;
    forUpdate(): SelectQuery;
    as(alias: string): SelectQuery;
  }

  interface SelectOneQuery extends SelectQuery {
    // SelectOneQuery inherits all methods from SelectQuery
  }

  interface SelectFunction {
    (columns?: any): SelectQuery;
    one: SelectOneQuery;
    from(entity: any): SelectQuery;
  }

  interface UpdateQuery {
    entity(entity: any): UpdateQuery;
    set(data: any): UpdateQuery;
    where(conditions: any): UpdateQuery;
  }

  interface UpdateFunction {
    (entity: any): UpdateQuery;
    entity(entity: any): UpdateQuery;
  }

  interface DeleteQuery {
    from(entity: any): DeleteQuery;
    where(conditions: any): DeleteQuery;
  }

  interface DeleteFunction {
    (from: any): DeleteQuery;
    from(entity: any): DeleteQuery;
  }

  interface InsertQuery {
    into(entity: any): InsertQuery;
    entries(data: any): InsertQuery;
  }

  interface InsertFunction {
    (data: any): InsertQuery;
    into(entity: any): InsertQuery;
  }

  export const SELECT: SelectFunction;
  export const UPDATE: UpdateFunction;
  export const DELETE: DeleteFunction;
  export const INSERT: InsertFunction;
  
  export interface Request {
    query: any;
    data: any;
    params: any;
    headers: Record<string, string>;
    user: any;
    tenant: any;
    locale: string;
    id: string;
    timestamp: Date;
    [key: string]: any;
  }
  
  export const entities: any;
  export const services: any;
  export const db: any;
}