bring cloud;

struct ApiEndpoint {
  api: cloud.Api;
  path: str;
}

struct DoubleEdgedFunctionProps {
  api: ApiEndpoint?;
}

class DoubleEdgedFunction extends cloud.Function {
  pub queue: cloud.Queue;

  new(handler: cloud.IFunctionHandler, props: DoubleEdgedFunctionProps) {
    super(handler);

    this.queue = new cloud.Queue();
    this.queue.setConsumer(inflight (message) => {
      this.invokeAsync(message);
    });

    if let api = props.api {
      api.api.get(api.path, inflight (req) => {
        let body = this.invoke(req.body);
        return {
          body: body
        };
      });
    }
  }
}

let fn = new DoubleEdgedFunction(inflight () => {
  log("hello, world");
  return Json.stringify({
    body: "hello, wing!"
  });
});

test "invoke directly" {
  let response = fn.invoke();
  log(response!);

}