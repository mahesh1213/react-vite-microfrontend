import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "app/store";
import { addTodo } from "app/todoActions";

function Todo() {
  const todos = useSelector((state: RootState) => state.todo.items);
  const dispatch = useDispatch();
  return (
    <>
      <div>Todo app working</div>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            dispatch(addTodo(e.currentTarget.value));
            e.currentTarget.value = "";
          }
        }}
      />
      <ul>
        {todos.map((t: string, i: number) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </>
  );
}

export default Todo;
