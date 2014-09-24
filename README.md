###This is a work in progress and not ready for prime time.

###JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/).

###Basic Usage

From the command line

```
$ git clone git@github.com:ChetHarrison/jsdoccer.git
$ cd jsdoccer
$ node document.js <filename>
```
Currently place the files to document in the `input/js` directory. For example if the contents of `example.js` were

```
var answer = 42;
```

and at the command line you typed

`node document.js example.js`

and you would get the following json syntax tree in the output directory

```
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "answer"
          },
          "init": {
            "type": "Literal",
            "value": 42,
            "raw": "42"
          }
        }
      ],
      "kind": "var"
    }
  ]
}
```

### Batch Jobs
Place all of your js files in the `input/js` directory. From the command line type `node document.js`. Documented files will be saved in the `output` directory.

### To Do
* parse syntax tree to ymal for jsdoc
* get kids to bed on time