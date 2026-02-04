DO NOT use plan mode. Alsways discuss in a conversational way.

# Wrote Editor

This is a block based wysiwyg notion-like editor. Key files:

- `./src/wrote-editor.js`: Entrypoint class
- `./src/wrote-styles.css`: Styles for the editor
- `./src/component/wrote-component.js`: Blocks are logically placed inside components. Components implement rules for navigation between blocks, like layouts
- `./src/component/vertical-layout.js`: The only component and layout for now
- `./src/block/wrote-block.js`: Block is the core class
- `./src/wrote-block-utils.js`: Many shared helpers for manipulating the dom and selection
- `./src/block/wrote-block-prefix.js`: Handles block indentation and list decoration like bullet points
- `./src/block/wrote-block-style.js`: Handles block styles like h1, h2, body
- `./src/block/wrote-inline-detector.js`: Handles parsing special sequences while typing like **bold** or `/` slash commands
- `./src/serde/`: Serialization and deserialization

Other files are self-explanatory.

## Tests

We have a test command `deno task test` which runs the tests in `./tests/` and prints the results. As we work we should update the test suite and also make sure the tests are passing.