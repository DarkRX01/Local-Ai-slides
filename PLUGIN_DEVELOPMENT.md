# Plugin Development Guide

Learn how to extend the Presentation App with custom plugins.

## Table of Contents

- [Overview](#overview)
- [Plugin Architecture](#plugin-architecture)
- [Creating Your First Plugin](#creating-your-first-plugin)
- [Plugin API Reference](#plugin-api-reference)
- [Plugin Types](#plugin-types)
- [Publishing Plugins](#publishing-plugins)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

The Presentation App plugin system allows you to extend functionality with custom:
- **UI Components** - Add new tools, panels, and controls
- **Element Types** - Create custom slide elements
- **Export Formats** - Add new export capabilities
- **AI Integrations** - Connect to additional AI services
- **Themes** - Package custom themes and layouts
- **Import/Export Filters** - Support additional file formats

### Plugin Benefits

- **Modular** - Plugins load independently without affecting core
- **Hot Reload** - Changes reload instantly during development
- **Type-Safe** - Full TypeScript support with intellisense
- **API Access** - Full access to presentation data and services
- **Distribution** - Share plugins via npm or local installation

---

## Plugin Architecture

### Plugin Structure

```
my-plugin/
├── package.json           # Plugin metadata and dependencies
├── index.ts              # Main entry point
├── manifest.json         # Plugin configuration
├── components/           # React components (if any)
│   └── MyTool.tsx
├── services/             # Backend services (if any)
│   └── myService.ts
└── assets/               # Static assets
    └── icon.png
```

### Manifest File

**manifest.json**:
```json
{
  "id": "my-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "Adds cool new features",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/you/my-plugin",
  
  "main": "./dist/index.js",
  "icon": "./assets/icon.png",
  
  "type": "element",
  "capabilities": [
    "editor",
    "export"
  ],
  
  "api": {
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0"
  },
  
  "permissions": [
    "storage.read",
    "storage.write",
    "network.external"
  ],
  
  "config": {
    "apiKey": {
      "type": "string",
      "description": "API key for service",
      "required": false
    }
  }
}
```

### Plugin Entry Point

**index.ts**:
```typescript
import { Plugin, PluginContext } from '@presentation-app/plugin-api';

export default class MyPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    // Initialize plugin
    console.log('My Plugin activated!');
    
    // Register capabilities
    this.registerElement();
    this.registerExporter();
    
    // Setup event listeners
    context.events.on('slide.created', this.onSlideCreated);
  }
  
  async deactivate(): Promise<void> {
    // Cleanup
    console.log('My Plugin deactivated');
  }
  
  private registerElement() {
    // Register custom element type
  }
  
  private registerExporter() {
    // Register custom export format
  }
  
  private onSlideCreated(slide: Slide) {
    console.log('New slide created:', slide.id);
  }
}
```

---

## Creating Your First Plugin

### Step 1: Setup Plugin Project

```bash
# Create plugin directory
mkdir my-plugin
cd my-plugin

# Initialize npm project
npm init -y

# Install plugin SDK
npm install @presentation-app/plugin-api

# Install TypeScript
npm install -D typescript @types/node @types/react

# Initialize TypeScript
npx tsc --init
```

### Step 2: Configure TypeScript

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "jsx": "react",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Create Manifest

**manifest.json**:
```json
{
  "id": "hello-world-plugin",
  "name": "Hello World Plugin",
  "version": "1.0.0",
  "description": "A simple example plugin",
  "author": "Your Name",
  "main": "./dist/index.js",
  "type": "ui",
  "capabilities": ["editor"]
}
```

### Step 4: Implement Plugin

**src/index.ts**:
```typescript
import { Plugin, PluginContext } from '@presentation-app/plugin-api';

export default class HelloWorldPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    // Add button to toolbar
    context.ui.toolbar.addButton({
      id: 'hello-world',
      label: 'Say Hello',
      icon: '👋',
      position: 'right',
      onClick: () => {
        context.ui.showNotification({
          message: 'Hello from plugin!',
          type: 'info',
          duration: 3000
        });
      }
    });
    
    // Add menu item
    context.ui.menu.addItem({
      section: 'tools',
      label: 'Hello World Tool',
      onClick: () => this.openPanel(context)
    });
  }
  
  private openPanel(context: PluginContext) {
    context.ui.panel.open({
      id: 'hello-world-panel',
      title: 'Hello World',
      component: () => '<div>Hello from panel!</div>',
      position: 'right',
      width: 300
    });
  }
  
  async deactivate(): Promise<void> {
    console.log('Goodbye!');
  }
}
```

### Step 5: Build Plugin

**package.json** scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "dev": "tsc --watch"
  }
}
```

Build:
```bash
npm run build
```

### Step 6: Install Plugin Locally

```bash
# From presentation app root
mkdir -p plugins
cd plugins
ln -s /path/to/my-plugin hello-world-plugin

# Or copy plugin
cp -r /path/to/my-plugin ./plugins/hello-world-plugin
```

### Step 7: Enable Plugin

1. Start presentation app: `npm run dev`
2. Open Settings → Plugins
3. Find "Hello World Plugin"
4. Click "Enable"
5. Plugin activated and button appears in toolbar!

---

## Plugin API Reference

### PluginContext

The context object provided to `activate()`:

```typescript
interface PluginContext {
  // Plugin info
  plugin: PluginInfo;
  
  // API access
  api: PresentationAPI;
  ui: UIContext;
  storage: StorageContext;
  events: EventEmitter;
  
  // Utilities
  utils: UtilsContext;
  logger: Logger;
}
```

### PresentationAPI

Access and modify presentation data:

```typescript
// Get current presentation
const presentation = context.api.presentation.getCurrent();

// Get all presentations
const presentations = context.api.presentation.getAll();

// Create new presentation
const newPresentation = await context.api.presentation.create({
  title: 'New Presentation',
  theme: defaultTheme
});

// Update presentation
await context.api.presentation.update(presentationId, {
  title: 'Updated Title'
});

// Delete presentation
await context.api.presentation.delete(presentationId);

// Get slides
const slides = context.api.slides.getAll(presentationId);

// Create slide
const slide = await context.api.slides.create({
  presentationId: presentationId,
  order: 0
});

// Update slide
await context.api.slides.update(slideId, {
  elements: updatedElements
});

// Delete slide
await context.api.slides.delete(slideId);
```

### UIContext

Interact with the user interface:

```typescript
// Show notification
context.ui.showNotification({
  message: 'Success!',
  type: 'success', // 'info' | 'success' | 'warning' | 'error'
  duration: 3000
});

// Show dialog
const result = await context.ui.showDialog({
  title: 'Confirm Action',
  message: 'Are you sure?',
  buttons: ['Cancel', 'OK']
});

// Add toolbar button
context.ui.toolbar.addButton({
  id: 'my-button',
  label: 'My Tool',
  icon: '🔧',
  onClick: () => { /* handler */ }
});

// Add menu item
context.ui.menu.addItem({
  section: 'tools',
  label: 'My Tool',
  shortcut: 'Ctrl+Shift+M',
  onClick: () => { /* handler */ }
});

// Open panel
context.ui.panel.open({
  id: 'my-panel',
  title: 'My Panel',
  component: MyPanelComponent,
  position: 'right',
  width: 400
});

// Close panel
context.ui.panel.close('my-panel');

// Add property editor
context.ui.properties.addSection({
  id: 'my-properties',
  label: 'My Properties',
  fields: [
    {
      id: 'color',
      label: 'Color',
      type: 'color',
      default: '#FF0000'
    }
  ],
  onUpdate: (values) => { /* handler */ }
});
```

### StorageContext

Persist plugin data:

```typescript
// Store data
await context.storage.set('myKey', { foo: 'bar' });

// Retrieve data
const data = await context.storage.get('myKey');

// Delete data
await context.storage.remove('myKey');

// Clear all plugin data
await context.storage.clear();

// Get all keys
const keys = await context.storage.keys();
```

### EventEmitter

Listen to application events:

```typescript
// Slide events
context.events.on('slide.created', (slide) => {
  console.log('Slide created:', slide);
});

context.events.on('slide.updated', (slide) => {
  console.log('Slide updated:', slide);
});

context.events.on('slide.deleted', (slideId) => {
  console.log('Slide deleted:', slideId);
});

// Element events
context.events.on('element.added', (element) => {
  console.log('Element added:', element);
});

context.events.on('element.updated', (element) => {
  console.log('Element updated:', element);
});

context.events.on('element.deleted', (elementId) => {
  console.log('Element deleted:', elementId);
});

// Presentation events
context.events.on('presentation.loaded', (presentation) => {
  console.log('Presentation loaded:', presentation);
});

context.events.on('presentation.saved', (presentation) => {
  console.log('Presentation saved:', presentation);
});

// Export events
context.events.on('export.started', (job) => {
  console.log('Export started:', job);
});

context.events.on('export.completed', (job) => {
  console.log('Export completed:', job);
});

// Remove listener
const handler = (slide) => { /* ... */ };
context.events.on('slide.created', handler);
context.events.off('slide.created', handler);
```

### Logger

Log messages with levels:

```typescript
context.logger.debug('Debug message');
context.logger.info('Info message');
context.logger.warn('Warning message');
context.logger.error('Error message');

// With data
context.logger.info('Processing slide', { slideId: 'abc123' });
```

---

## Plugin Types

### 1. Element Plugins

Create custom slide element types:

```typescript
export default class CustomElementPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    context.api.elements.registerType({
      type: 'qr-code',
      name: 'QR Code',
      icon: '📱',
      
      // Default properties
      defaultProps: {
        url: 'https://example.com',
        size: 200,
        foreground: '#000000',
        background: '#FFFFFF'
      },
      
      // Render function
      render: (element, ctx) => {
        // Draw QR code on canvas
        const qrCode = generateQRCode(element.properties.url);
        ctx.drawImage(qrCode, element.position.x, element.position.y);
      },
      
      // Property editor
      propertyEditor: [
        {
          id: 'url',
          label: 'URL',
          type: 'text'
        },
        {
          id: 'size',
          label: 'Size',
          type: 'number',
          min: 50,
          max: 500
        },
        {
          id: 'foreground',
          label: 'Foreground Color',
          type: 'color'
        }
      ]
    });
    
    // Add to toolbar
    context.ui.toolbar.addButton({
      id: 'add-qr-code',
      label: 'QR Code',
      icon: '📱',
      onClick: () => {
        context.api.elements.add({
          type: 'qr-code',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 }
        });
      }
    });
  }
}
```

### 2. Export Plugins

Add custom export formats:

```typescript
export default class CustomExportPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    context.api.export.registerFormat({
      id: 'markdown',
      name: 'Markdown',
      extension: '.md',
      mimeType: 'text/markdown',
      
      // Export function
      export: async (presentation, options) => {
        let markdown = `# ${presentation.title}\n\n`;
        
        for (const slide of presentation.slides) {
          markdown += `## Slide ${slide.order + 1}\n\n`;
          
          for (const element of slide.elements) {
            if (element.type === 'text') {
              markdown += `${element.properties.text}\n\n`;
            }
          }
        }
        
        return {
          data: markdown,
          filename: `${presentation.title}.md`
        };
      },
      
      // Options schema
      options: [
        {
          id: 'includeNotes',
          label: 'Include Speaker Notes',
          type: 'boolean',
          default: false
        }
      ]
    });
  }
}
```

### 3. AI Integration Plugins

Connect to AI services:

```typescript
export default class CustomAIPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    context.api.ai.registerProvider({
      id: 'my-ai-service',
      name: 'My AI Service',
      
      // Generate text
      generate: async (prompt, options) => {
        const response = await fetch('https://my-ai-api.com/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getConfig('apiKey')}`
          },
          body: JSON.stringify({ prompt, ...options })
        });
        
        const data = await response.json();
        return data.text;
      },
      
      // Generate presentation
      generatePresentation: async (prompt, config) => {
        // Call AI API and return presentation structure
        return {
          title: 'Generated Presentation',
          slides: [/* ... */]
        };
      }
    });
    
    // Add to UI
    context.ui.menu.addItem({
      section: 'ai',
      label: 'Generate with My AI',
      onClick: () => this.showAIDialog(context)
    });
  }
  
  private async showAIDialog(context: PluginContext) {
    const prompt = await context.ui.showInput({
      title: 'AI Generation',
      label: 'Enter prompt:',
      placeholder: 'Create a presentation about...'
    });
    
    if (prompt) {
      const presentation = await context.api.ai.generatePresentation(prompt, {
        provider: 'my-ai-service',
        slideCount: 10
      });
      
      // Load generated presentation
      await context.api.presentation.create(presentation);
    }
  }
}
```

### 4. Theme Plugins

Package custom themes:

```typescript
export default class CustomThemePlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    context.api.themes.register({
      id: 'ocean-theme',
      name: 'Ocean',
      description: 'Cool ocean-inspired theme',
      
      theme: {
        colors: {
          primary: '#006994',
          secondary: '#00A3CC',
          accent: '#F0F8FF',
          background: '#E6F3F5',
          text: '#002B36'
        },
        fonts: {
          heading: 'Montserrat',
          body: 'Open Sans'
        },
        mode: 'light'
      },
      
      // Default layouts
      layouts: [
        {
          id: 'ocean-title',
          name: 'Ocean Title Slide',
          thumbnail: './assets/ocean-title.png',
          elements: [
            {
              type: 'text',
              properties: {
                text: 'Title',
                fontSize: 64,
                fontFamily: 'Montserrat',
                color: '#006994'
              },
              position: { x: 100, y: 300 },
              size: { width: 800, height: 100 }
            }
          ]
        }
      ]
    });
  }
}
```

### 5. Import/Export Filter Plugins

Support additional file formats:

```typescript
export default class CustomImportPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    // Register import filter
    context.api.import.registerFilter({
      id: 'keynote-importer',
      name: 'Keynote Importer',
      extensions: ['.key'],
      
      import: async (file) => {
        // Parse Keynote file
        const keynoteData = await this.parseKeynote(file);
        
        // Convert to presentation format
        return {
          title: keynoteData.title,
          slides: keynoteData.slides.map(slide => ({
            elements: this.convertElements(slide.elements),
            background: this.convertBackground(slide.background)
          }))
        };
      }
    });
  }
  
  private async parseKeynote(file: File): Promise<any> {
    // Implementation to parse Keynote format
  }
}
```

---

## Publishing Plugins

### Packaging

1. **Build plugin**:
   ```bash
   npm run build
   ```

2. **Create package.json**:
   ```json
   {
     "name": "@presentation-app/plugin-my-plugin",
     "version": "1.0.0",
     "description": "My awesome plugin",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": [
       "dist",
       "manifest.json",
       "assets"
     ],
     "keywords": [
       "presentation-app-plugin",
       "presentation",
       "plugin"
     ],
     "peerDependencies": {
       "@presentation-app/plugin-api": "^1.0.0"
     }
   }
   ```

3. **Test locally**:
   ```bash
   npm pack
   # Creates: presentation-app-plugin-my-plugin-1.0.0.tgz
   
   # Install in presentation app
   cd /path/to/presentation-app/plugins
   npm install /path/to/plugin/presentation-app-plugin-my-plugin-1.0.0.tgz
   ```

### Publishing to npm

```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

### Plugin Repository

Submit plugin to official registry:

1. Create repository on GitHub
2. Add topic: `presentation-app-plugin`
3. Submit PR to [plugin registry](https://github.com/presentation-app/plugins)
4. Add plugin to `plugins.json`:
   ```json
   {
     "id": "my-plugin",
     "name": "My Plugin",
     "description": "Does cool things",
     "author": "Your Name",
     "npm": "@presentation-app/plugin-my-plugin",
     "github": "you/my-plugin",
     "version": "1.0.0"
   }
   ```

---

## Best Practices

### Performance

1. **Lazy load** - Only load resources when needed
2. **Debounce** - Debounce expensive operations
3. **Workers** - Use Web Workers for heavy computations
4. **Cleanup** - Remove event listeners in `deactivate()`
5. **Cache** - Cache computed values when possible

### Security

1. **Validate input** - Always validate user input
2. **Sanitize HTML** - Use DOMPurify for user-generated HTML
3. **API keys** - Store in config, never hardcode
4. **Permissions** - Request minimum necessary permissions
5. **HTTPS only** - Use HTTPS for external requests

### Error Handling

```typescript
async activate(context: PluginContext): Promise<void> {
  try {
    // Plugin initialization
    await this.initialize(context);
  } catch (error) {
    context.logger.error('Plugin activation failed', error);
    context.ui.showNotification({
      message: 'Plugin failed to activate',
      type: 'error'
    });
    
    // Cleanup partial state
    await this.cleanup();
  }
}
```

### Testing

```typescript
// tests/plugin.test.ts
import { createMockContext } from '@presentation-app/plugin-api/testing';
import MyPlugin from '../src/index';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let context: PluginContext;
  
  beforeEach(() => {
    context = createMockContext();
    plugin = new MyPlugin();
  });
  
  it('should activate successfully', async () => {
    await plugin.activate(context);
    expect(context.ui.toolbar.addButton).toHaveBeenCalled();
  });
  
  it('should handle errors gracefully', async () => {
    context.api.presentation.getCurrent.mockRejectedValue(new Error('Failed'));
    await plugin.activate(context);
    expect(context.logger.error).toHaveBeenCalled();
  });
});
```

### Documentation

Include comprehensive README:

```markdown
# My Plugin

Description of what the plugin does.

## Installation

npm install @presentation-app/plugin-my-plugin

## Usage

1. Enable plugin in Settings → Plugins
2. Click the new button in toolbar
3. Configure settings

## Configuration

- `apiKey` - Your API key
- `defaultColor` - Default color (hex)

## License

MIT
```

---

## Examples

### Example 1: Weather Widget

Display weather in slides:

```typescript
import { Plugin, PluginContext } from '@presentation-app/plugin-api';

export default class WeatherPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    // Register custom element
    context.api.elements.registerType({
      type: 'weather',
      name: 'Weather Widget',
      icon: '🌤️',
      
      defaultProps: {
        city: 'London',
        units: 'metric'
      },
      
      render: async (element, ctx) => {
        const weather = await this.fetchWeather(
          element.properties.city,
          element.properties.units
        );
        
        // Render weather widget
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(element.position.x, element.position.y, 300, 150);
        
        ctx.fillStyle = '#000000';
        ctx.font = '24px Arial';
        ctx.fillText(`${weather.temp}°C`, element.position.x + 20, element.position.y + 50);
        ctx.fillText(weather.description, element.position.x + 20, element.position.y + 90);
      },
      
      propertyEditor: [
        {
          id: 'city',
          label: 'City',
          type: 'text'
        },
        {
          id: 'units',
          label: 'Units',
          type: 'select',
          options: ['metric', 'imperial']
        }
      ]
    });
  }
  
  private async fetchWeather(city: string, units: string) {
    const apiKey = this.getConfig('apiKey');
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
    );
    return response.json();
  }
}
```

### Example 2: Chart Generator

Generate charts from data:

```typescript
import { Plugin, PluginContext } from '@presentation-app/plugin-api';
import Chart from 'chart.js/auto';

export default class ChartPlugin extends Plugin {
  async activate(context: PluginContext): Promise<void> {
    context.ui.menu.addItem({
      section: 'tools',
      label: 'Create Chart',
      onClick: () => this.createChart(context)
    });
  }
  
  private async createChart(context: PluginContext) {
    // Show data input dialog
    const data = await context.ui.showForm({
      title: 'Create Chart',
      fields: [
        {
          id: 'type',
          label: 'Chart Type',
          type: 'select',
          options: ['bar', 'line', 'pie']
        },
        {
          id: 'data',
          label: 'Data (CSV)',
          type: 'textarea'
        }
      ]
    });
    
    if (data) {
      // Parse CSV data
      const chartData = this.parseCSV(data.data);
      
      // Generate chart image
      const canvas = document.createElement('canvas');
      const chart = new Chart(canvas, {
        type: data.type,
        data: chartData
      });
      
      // Convert to image
      const imageUrl = canvas.toDataURL();
      
      // Add to slide
      context.api.elements.add({
        type: 'image',
        properties: {
          url: imageUrl
        },
        position: { x: 100, y: 100 },
        size: { width: 600, height: 400 }
      });
    }
  }
  
  private parseCSV(csv: string): any {
    // CSV parsing logic
  }
}
```

---

## Support

For plugin development help:

- **API Documentation**: Full API reference at [api-docs.presentation-app.com](https://api-docs.presentation-app.com)
- **Examples Repository**: https://github.com/presentation-app/plugin-examples
- **Discord Community**: https://discord.gg/presentation-app
- **Stack Overflow**: Tag questions with `presentation-app-plugin`

---

**Happy plugin development!** 🚀
