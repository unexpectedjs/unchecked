const expect = require("unexpected").clone();

expect.use(require("unexpected-check"));

const forall = (...args) => {
  const test = args.pop();

  let options = {};
  if (args[args.length - 1] && !args[args.length - 1].isGenerator) {
    options = args.pop();
  }

  if (
    typeof options.maxIterations !== "number" &&
    process.env.UNCHECKED_MAX_ITERATIONS
  ) {
    options.maxIterations = Number(process.env.UNCHECKED_MAX_ITERATIONS);
  }

  return expect(test, "to be valid for all", {
    ...options,
    generators: args,
  });
};

module.exports = {
  get preferredWidth() {
    return expect.output.preferredWidth;
  },
  set preferredWidth(value) {
    expect.output.preferredWidth = value;
  },
  forall,
};
