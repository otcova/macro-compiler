# Macro Compiler

Separate explicitly portions of code that will
be executed only on a specific target.

## Example

- File: `src/index.ts`
```ts
//! if target == Browser
import { Buffer } from "./my-custom-browser-buffer";

/*! if target == NodeJs
import { Buffer } from "node:buffer";
import { RTCPeerConnection } from "wrtc";
*/

...
```

- File: `src/my-custom-browser-buffer.ts`
```ts
//!file if target == Browser

...
```

Once we run the compiler (`npx macro-compiler src`).
The nodejs and browser code will be generated.

- Generated File: `NodeJs/src/index.ts`
```ts
//!start if target == NodeJs
import { Buffer } from "node:buffer";
import { RTCPeerConnection } from "wrtc";
//!end

...
```

- Generated File: `Browser/src/index.ts`
```ts
//! if target == Browser
import { Buffer } from "./my-custom-browser-buffer";

...
```

- Generated File: `Browser/src/my-custom-browser-buffer.ts`
```ts
//!file if target == Browser

...
```

## How it works

The code will be divided into various sections
The sections are defined explicitly with macros.
The purpose is to separate portions of code that will
be executed only on a specific target.

### Macros

They are simple comments that define what code will be deleted
or conserved depending on the target.
The macros can select lines, blocks or files.

#### Select a line
Defined by `//!`. It will select only the next line
```ts
//! if target == NodeJs
console.log("Code that will run on NodeJs");
console.log("Code that will run on every where");
```

### Select a block
Defined in two ways:
 - `//!start` & `//!end`
 - `/*!` & `*/`

The first option is recommended because it will have syntax highlighting.
However, sometimes the second option is preferable. If we define or import
a value in multiple targets, the IDE will signal a `Duplicate identifier` error.

The `/*! ... */` macro should only be used to prevent duplicate imports.
The target-specific variables/methods can be defined on a custom
file (see [Select a File](#select-a-file)).

```ts
//! if target == NodeJs
import { deflate, inflate } from "zlib";

/*! if target == Browser
import { deflate, inflate } from "./browser-zlib";
*/

//!start if target == NodeJs
console.log(inflate(deflate("Node")));
...
console.log(inflate(deflate("And only Node")));
//!end
```


### Select a file

Defined by `//!file` on the beginning of the file.
It will remove or copy the file depending on the target.

```ts
//!file if target == Browser

console.log("A file for the browser");

...

export const Buffer = MyWebBuffer;
```
