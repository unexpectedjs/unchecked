const expect = require("unexpected");

expect
  .addType({
    base: "Error",
    name: "AssertionError",
    identify: err =>
      err &&
      typeof err === "object" &&
      err.constructor.name === "AssertionError",
    inspect: (value, depth, output, inspect) => {
      output.error(value.message);

      if ("actual" in value && "expected" in value) {
        const diff = expect.diff(value.actual, value.expected, output.clone());

        if (diff) {
          output.nl(2).append(diff);
        }
      }
    }
  })
  .use(require("unexpected-check"));

const forall = (...args) => {
  const test = args.pop();

  let options = {};
  if (args[args.length - 1] && !args[args.length - 1].isGenerator) {
    options = args.pop();
  }

  return expect(test, "to be valid for all", {
    ...options,
    generators: args
  });
};

module.exports = {
  forall
};
