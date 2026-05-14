declare module "app/store" {
  export interface RootState {
    todo: {
      items: string[];
    };
  }
}

declare module "app/todoActions" {
  export function addTodo(payload: string): {
    type: string;
    payload: string;
  };
}
