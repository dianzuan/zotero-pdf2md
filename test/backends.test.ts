import { assert } from "chai";
import {
  BackendRegistry,
  type IOcrBackend,
  type BackendConfig,
  type ConversionResult,
} from "../src/backends/base.js";

/** A mock backend that returns fixed markdown for testing */
class MockBackend implements IOcrBackend {
  readonly name = "mock";
  readonly label = "Mock Backend";

  async convert(
    pdfPath: string,
    _config: BackendConfig,
  ): Promise<ConversionResult> {
    return {
      markdown: `# Mock\n\nConverted from: ${pdfPath}`,
      pageCount: 1,
    };
  }
}

describe("IOcrBackend interface", function () {
  it("MockBackend should implement IOcrBackend correctly", async function () {
    const backend: IOcrBackend = new MockBackend();
    assert.equal(backend.name, "mock");
    assert.equal(backend.label, "Mock Backend");

    const result = await backend.convert("/tmp/test.pdf", {});
    assert.include(result.markdown, "# Mock");
    assert.include(result.markdown, "/tmp/test.pdf");
    assert.equal(result.pageCount, 1);
  });
});

describe("BackendRegistry", function () {
  let registry: BackendRegistry;

  beforeEach(function () {
    registry = new BackendRegistry();
  });

  it("should start empty", function () {
    assert.deepEqual(registry.list(), []);
    assert.isFalse(registry.has("mock"));
  });

  it("should register and retrieve a backend", function () {
    const mock = new MockBackend();
    registry.register(mock);

    assert.isTrue(registry.has("mock"));
    assert.equal(registry.get("mock"), mock);
    assert.deepEqual(registry.list(), ["mock"]);
  });

  it("should return undefined for unknown backend", function () {
    assert.isUndefined(registry.get("nonexistent"));
  });

  it("should support multiple backends", function () {
    const mock1 = new MockBackend();
    const mock2: IOcrBackend = {
      name: "another",
      label: "Another Backend",
      convert: async () => ({ markdown: "" }),
    };

    registry.register(mock1);
    registry.register(mock2);

    assert.equal(registry.list().length, 2);
    assert.isTrue(registry.has("mock"));
    assert.isTrue(registry.has("another"));
  });

  it("should overwrite backend with same name", function () {
    const mock1 = new MockBackend();
    const mock2: IOcrBackend = {
      name: "mock",
      label: "Replaced Mock",
      convert: async () => ({ markdown: "" }),
    };

    registry.register(mock1);
    registry.register(mock2);

    assert.equal(registry.list().length, 1);
    assert.equal(registry.get("mock")?.label, "Replaced Mock");
  });
});
