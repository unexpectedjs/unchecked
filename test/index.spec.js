const expect = require("unexpected");
const { array, integer } = require("chance-generators");
const { forall } = require("../src/");
const assert = require("assert");
const util = require("util");

const isSorted = array =>
  array.every((x, i) => array.slice(i).every(y => x <= y));

const sort = (arr, cmp) => [].concat(arr).sort(cmp);

describe("forall", () => {
  it("fails with an informative error message", () => {
    expect(
      () => {
        forall(array(integer), numbers => {
          const sorted = sort(numbers);

          assert(
            isSorted(sorted),
            `expected ${util.inspect(sorted)} to be sorted`
          );
        });
      },
      "to throw",
      "Found an error after 1 iteration, 123 additional errors found.\n" +
        "counterexample:\n" +
        "\n" +
        "  Generated input: [ -2, -1 ]\n" +
        "  with: array({ itemGenerator: integer, min: 0, max: 30 })\n" +
        "\n" +
        "  expected [ -1, -2 ] to be sorted"
    );
  });

  it("succeeds when the body does not throw", () => {
    return forall(array(integer), numbers => {
      const sorted = sort(numbers, (a, b) => a - b);

      assert(isSorted(sorted), `expected ${util.inspect(sorted)} to be sorted`);
    });
  });
});
