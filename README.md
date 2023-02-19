# Macro Compiler

Separate explicitly portions of code that will
be executed only on a specific target.

## Example

- File: `src-folder/index.ts`
```ts
//! if target == Browser
// import { Buffer } from "./my-custom-browser-buffer";

//!start if target == NodeJs
import { Buffer } from "node:buffer";
import { RTCPeerConnection } from "wrtc";
//!end

...
```

- File: `src-folder/my-custom-browser-buffer.ts`
```ts
//!file if target == Browser

...
```

Once we run the compiler (`npx macro-compiler src-folder`).
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
Defined by `//!`, it will only select the next line.

```ts
//! if target == NodeJs
console.log("Code that will run on NodeJs");
console.log("Code that will run every where");
```

If we concatenate multiple blocks, the IDE can think that we are makeing
a `Duplicate identifier` error.
To prevent that you can comment the selected line.
The macro-compiler will uncomment the code if the target is selected.

### Select a block

Selcets the code that is in between (`//!start` or `/*!`) and (`//!end` or `*/`).


The `/*!` `*/` macro should only be used on imports because it
is going to disable the syntax highlighting.
It is recommended to write the code on a different file (see [Select a File](#select-a-file)).

```ts
//!start if target == NodeJs
import { deflate, inflate } from "node:zlib";
import { Buffer } from "node:buffer";
//!end

/*! if target == Browser
import { deflate, inflate } from "./browser-zlib";
import { Buffer } from "./browser-buffer";
*/
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

## CLI

- Usage:  `macro-compiler [source directory/file] [optional-flags]`

- Example:  `macro-compiler src-folder -t NodeJs dist/nodejs/src Browser dist/browser/src`

| Flag             | Description                                      | Default                                 |
| ---------------- | ------------------------------------------------ | --------------------------------------- |
| `-t`, `--target`  | Set the compilation targets                      | `NodeJs NodeJs/src Browser Browser/src` |
| `-r`, `--rootDir` | Specify the root folder                          | current-directory                       |
| `-c`, `--clean`    | Delete the target directories before compilation | `true`                                  |  |
