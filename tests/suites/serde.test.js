import { logTest, assertDeepEqual, reportResults } from '/tests/helpers.js';
import { serializeComponent } from '/src/serde/serializer.js';
import { deserializeComponent } from '/src/serde/deserializer.js';
import { VerticalLayout } from '/src/component/vertical-layout.js';
import { WroteBlock } from '/src/block/wrote-block.js';

// Simple block with plain text
try {
  const component = new VerticalLayout();
  const block = new WroteBlock(component);
  component.blocks.push(block);

  block.contentElement.textContent = 'Hello World';

  const json = serializeComponent(component);
  const expected = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Hello World'
      }
    ]
  };

  assertDeepEqual(json, expected);
  logTest('[Serialization] Plain text', true, JSON.stringify(json, null, 2));
} catch (e) {
  logTest('[Serialization] Plain text', false, e.message);
}

// Block with bold and italic formatting
try {
  const component = new VerticalLayout();
  const block = new WroteBlock(component);
  component.blocks.push(block);

  block.contentElement.innerHTML = 'Hello <strong>bold</strong> and <em>italic</em>';

  const json = serializeComponent(component);
  const expected = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Hello <strong>bold</strong> and <em>italic</em>'
      }
    ]
  };

  assertDeepEqual(json, expected);
  logTest('[Serialization] Bold and italic formatting', true, JSON.stringify(json, null, 2));
} catch (e) {
  logTest('[Serialization] Bold and italic formatting', false, e.message);
}

// Block with nested formatting
try {
  const component = new VerticalLayout();
  const block = new WroteBlock(component);
  component.blocks.push(block);

  block.contentElement.innerHTML = 'Start <strong>bold <em>bold-italic</em> bold</strong> end';

  const json = serializeComponent(component);
  const expected = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Start <strong>bold <em>bold-italic</em> bold</strong> end'
      }
    ]
  };

  assertDeepEqual(json, expected);
  logTest('[Serialization] Nested formatting', true, JSON.stringify(json, null, 2));
} catch (e) {
  logTest('[Serialization] Nested formatting', false, e.message);
}

// Block with h1 style
try {
  const component = new VerticalLayout();
  const block = new WroteBlock(component);
  component.blocks.push(block);

  block.setStyle('h1');
  block.contentElement.textContent = 'This is a heading';

  const json = serializeComponent(component);
  const expected = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'h1',
        indent: 0,
        prefix: null,
        content: 'This is a heading'
      }
    ]
  };

  assertDeepEqual(json, expected);
  logTest('[Serialization] Block with h1 style', true, JSON.stringify(json, null, 2));
} catch (e) {
  logTest('[Serialization] Block with h1 style', false, e.message);
}

// Deserialization: Plain text
try {
  const json = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Hello World'
      }
    ]
  };

  const component = deserializeComponent(json);
  const expectedHTML = 'Hello World';

  if (component.blocks[0].contentElement.innerHTML !== expectedHTML) {
    throw new Error(`Expected innerHTML: "${expectedHTML}", got: "${component.blocks[0].contentElement.innerHTML}"`);
  }

  logTest('[Deserialization] Plain text', true, `innerHTML: "${component.blocks[0].contentElement.innerHTML}"`);
} catch (e) {
  logTest('[Deserialization] Plain text', false, e.message);
}

// Deserialization: Bold and italic formatting
try {
  const json = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Hello <strong>bold</strong> and <em>italic</em>'
      }
    ]
  };

  const component = deserializeComponent(json);
  const expectedHTML = 'Hello <strong>bold</strong> and <em>italic</em>';

  if (component.blocks[0].contentElement.innerHTML !== expectedHTML) {
    throw new Error(`Expected innerHTML: "${expectedHTML}", got: "${component.blocks[0].contentElement.innerHTML}"`);
  }

  logTest('[Deserialization] Bold and italic formatting', true, `innerHTML: "${component.blocks[0].contentElement.innerHTML}"`);
} catch (e) {
  logTest('[Deserialization] Bold and italic formatting', false, e.message);
}

// Deserialization: Nested formatting
try {
  const json = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Start <strong>bold <em>bold-italic</em> bold</strong> end'
      }
    ]
  };

  const component = deserializeComponent(json);
  const expectedHTML = 'Start <strong>bold <em>bold-italic</em> bold</strong> end';

  if (component.blocks[0].contentElement.innerHTML !== expectedHTML) {
    throw new Error(`Expected innerHTML: "${expectedHTML}", got: "${component.blocks[0].contentElement.innerHTML}"`);
  }

  logTest('[Deserialization] Nested formatting', true, `innerHTML: "${component.blocks[0].contentElement.innerHTML}"`);
} catch (e) {
  logTest('[Deserialization] Nested formatting', false, e.message);
}

// Deserialization: Block with h1 style
try {
  const json = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'h1',
        indent: 0,
        prefix: null,
        content: 'This is a heading'
      }
    ]
  };

  const component = deserializeComponent(json);
  const expectedHTML = 'This is a heading';

  if (component.blocks[0].contentElement.innerHTML !== expectedHTML) {
    throw new Error(`Expected innerHTML: "${expectedHTML}", got: "${component.blocks[0].contentElement.innerHTML}"`);
  }
  if (component.blocks[0].style !== 'h1') {
    throw new Error(`Expected style 'h1', got '${component.blocks[0].style}'`);
  }

  logTest('[Deserialization] Block with h1 style', true, `innerHTML: "${component.blocks[0].contentElement.innerHTML}", style: "${component.blocks[0].style}"`);
} catch (e) {
  logTest('[Deserialization] Block with h1 style', false, e.message);
}

// Sanitization: Disallowed tags are removed
try {
  const component = new VerticalLayout();
  const block = new WroteBlock(component);
  component.blocks.push(block);

  block.contentElement.innerHTML = 'Hello <div>disallowed</div> and <script>alert("xss")</script> <strong>bold</strong>';

  const json = serializeComponent(component);
  const expected = {
    type: 'vertical-layout',
    blocks: [
      {
        style: 'body',
        indent: 0,
        prefix: null,
        content: 'Hello disallowed and alert("xss") <strong>bold</strong>'
      }
    ]
  };

  assertDeepEqual(json, expected);
  logTest('[Serialization] Disallowed tags are removed', true, JSON.stringify(json, null, 2));
} catch (e) {
  logTest('[Serialization] Disallowed tags are removed', false, e.message);
}

// Roundtrip - serialize and deserialize
try {
  const component1 = new VerticalLayout();
  const block1 = new WroteBlock(component1);
  component1.blocks.push(block1);
  block1.contentElement.innerHTML = 'Test <strong>bold</strong> content';

  const json1 = serializeComponent(component1);
  const component2 = deserializeComponent(json1);
  const json2 = serializeComponent(component2);

  assertDeepEqual(json2, json1);
  const jsonStr = `Original:\n${JSON.stringify(json1, null, 2)}\n\nAfter roundtrip:\n${JSON.stringify(json2, null, 2)}\n\nContent element HTML after deserialize:\n${component2.blocks[0].contentElement.innerHTML}`;

  logTest('[Roundtrip] Serialize and deserialize', true, jsonStr);
} catch (e) {
  logTest('[Roundtrip] Serialize and deserialize', false, e.message);
}

reportResults();
