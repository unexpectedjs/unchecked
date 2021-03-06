const expect = require("unexpected");
const { array, integer, string } = require("chance-generators");
const { forall } = require("../src/");
const assert = require("assert");
const util = require("util");

const isSorted = (array) =>
  array.every((x, i) => array.slice(i).every((y) => x <= y));

const sort = (arr, cmp) => [].concat(arr).sort(cmp);

describe("forall", () => {
  it("fails with an informative error message", () => {
    expect(
      () => {
        forall(array(integer), (numbers) => {
          const sorted = sort(numbers);

          assert.equal(
            sorted.length,
            numbers.length,
            `expected ${util.inspect(
              sorted
            )} to have same length as ${util.inspect(numbers)}`
          );

          assert(
            isSorted(sorted),
            `expected ${util.inspect(sorted)} to be sorted`
          );
        });
      },
      "to throw",
      "Found an error after 1 iteration, 58 additional errors found.\n" +
        "counterexample:\n" +
        "\n" +
        "  Generated input: [ 10, 2 ]\n" +
        "  with: array({ itemGenerator: integer, min: 0, max: 30 })\n" +
        "\n" +
        "  expected [ 10, 2 ] to be sorted"
    );
  });

  it("succeeds when the body does not throw", () => {
    forall(array(integer), (numbers) => {
      const sorted = sort(numbers, (a, b) => a - b);

      assert.equal(
        sorted.length,
        numbers.length,
        `expected ${util.inspect(sorted)} to have same length as ${util.inspect(
          numbers
        )}`
      );

      assert(isSorted(sorted), `expected ${util.inspect(sorted)} to be sorted`);
    });
  });

  it("shows a diff if actual and expected is defined on the error", () => {
    expect(
      () => {
        forall(string({ min: 3 }), string({ min: 3 }), (a, b) => {
          assert.equal(a, b);
        });
      },
      "to throw",
      "Found an error after 1 iteration, 10 additional errors found.\n" +
        "counterexample:\n" +
        "\n" +
        "  Generated input: '(n2', 'hrm'\n" +
        "  with: string({ min: 3, max: 30 }), string({ min: 3, max: 30 })\n" +
        "\n" +
        "  '(n2' == 'hrm'"
    );
  });

  it("supports asynchronous tests", () =>
    expect(
      () =>
        forall(
          string({ min: 3 }),
          string({ min: 3 }),
          (a, b) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                try {
                  assert.equal(a, b);
                  resolve();
                } catch (e) {
                  reject(e);
                }
              }, 1);
            })
        ),
      "to error",
      "Found an error after 1 iteration, 10 additional errors found.\n" +
        "counterexample:\n" +
        "\n" +
        "  Generated input: '(n2', 'hrm'\n" +
        "  with: string({ min: 3, max: 30 }), string({ min: 3, max: 30 })\n" +
        "\n" +
        "  '(n2' == 'hrm'"
    ));
});
