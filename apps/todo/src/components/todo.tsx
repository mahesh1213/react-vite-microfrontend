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
        id="todo-input"
        type="text"
        className="
        w-full
        border
        rounded-lg
        border-gray-300
        focus:border-blue-500
        focus:ring-blue-500
      "
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            dispatch(addTodo(e.currentTarget.value));
            e.currentTarget.value = "";
          }
        }}
      />
      <button className="btn-primary">Save</button>
      <ul>
        {todos.map((t: string, i: number) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </>
  );
}

export default Todo;
