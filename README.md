###This is a work in progress and not ready for prime time.

###JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/) and [ESCodeGen](https://github.com/Constellation/escodegen).

###ASTs

An AST or Abstract Syntax Tree is a typed representation of valid code. Esprima will parse ASTs from valid ECMAScript and ESCodeGen provides an "inverse" operation that will generate valid ECMAScript from Esprima ASTs.

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

You can configure the task to document any type defined by the [Spider Monkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions). Add an argument for each type you would like to document then add any child attribute names you would like to collect to its associated `attributes` array. Any child attributes with code you would like to reference, such as a function body, add to its associated `code` attribute.

#### Example Config

The following example will document all functions, their parameters, and provide the code for thier function bodies.

```
var syntaxWhitelist = {
    // This would parse a function name, its 
    // parameter names, and its body code.
    FunctionDeclaration: {
      attributes: ['id', 'params'],
      code: ['body']
    }
  };
```



### Batch Jobs
Place all of your js files in the `input/js` directory. From the command line type `node document.js`. Documented files will be saved in the `output` directory.

### To Do
* template ymal from target JSON parse results for jsdoc.
* convert to grunt task.
* consult external config file.