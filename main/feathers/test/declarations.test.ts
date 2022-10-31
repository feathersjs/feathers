// deno-lint-ignore-file require-await
import { assert, describe, it } from "../../commons/mod.ts";
import { hooks } from "https://deno.land/x/hooks@v0.7.5/src/index.ts";
import {
  feathers,
  ServiceInterface,
  Application,
  HookContext,
  NextFunction,
} from "../mod.ts";

interface Todo {
  id: number;
  message: string;
  completed: boolean;
}

interface TodoData {
  message: string;
  completed?: boolean;
}

class TodoService implements ServiceInterface<Todo, TodoData> {
  constructor(public todos: Todo[] = []) {}

  async find() {
    return this.todos;
  }

  async create(data: TodoData) {
    const { completed = false } = data;
    const todo: Todo = {
      id: this.todos.length,
      completed,
      message: data.message,
    };

    this.todos.push(todo);

    return todo;
  }

  async setup(app: Application) {
    assert(app);
  }
}

interface Configuration {
  port: number;
}

interface Services {
  todos: TodoService;
  v2: Application<Record<string, unknown>, Configuration>;
}

type MainApp = Application<Services, Configuration>;

const myHook = async (context: HookContext<MainApp>, next: NextFunction) => {
  assert(context.app.service("todos"));
  await next();
};

hooks(TodoService.prototype, [
  async (_ctx: HookContext<MainApp>, next) => {
    await next();
  },
]);

hooks(TodoService, {
  create: [myHook],
});

describe("Feathers typings", () => {
  it("initializes the app with proper types", async () => {
    const app: MainApp = feathers<Services, Configuration>();
    const app2 = feathers<Record<string, unknown>, Configuration>();

    app.set("port", 80);
    app.use("todos", new TodoService());
    app.use("v2", app2);

    const service = app.service("todos");

    service.on("created", (data: unknown) => {
      assert(data);
    });

    service.hooks({
      before: {
        all: [],
        create: [
          async (context) => {
            const { result, data } = context;

            assert(result);
            assert(data);
            assert(context.app.service("todos"));
          },
        ],
      },
    });

    service.hooks({
      create: [
        async (context, next) => {
          assert(context);
          await next();
        },
        async (context, next) => {
          assert(context);
          await next();
        },
        myHook,
      ],
    });
  });
});
