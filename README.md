###This is a work in progress and not ready for prime time.

###JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/) and [ESCodeGen](https://github.com/Constellation/escodegen).

###Basic Usage

From the command line

```
$ git clone git@github.com:ChetHarrison/jsdoccer.git
$ cd jsdoccer
$ node document.js
```

###ASTs

An AST or Abstract Syntax Tree is a typed representation of valid code. Esprima will parse ASTs from valid ECMAScript and ESCodeGen provides an "inverse" operation that will generate valid ECMAScript from Esprima ASTs.

Esprima will parse this:

```
var answer = 42;
```

into this AST:

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

The following example will document all functions, their parameters, and provide the code for thier function bodies. See `syntaxWhitelist` where `FunctionDeclaration` represents a valid API Parser type and the `attributes` and `code` items are children of that type.

```
{
  "js": {
    "scr": "./input/js"
  },
  "ast": {
    "dest": "./output",
    "save": true
  },
  "yaml": {
    "templates": "./templates",
    "dest": "./yaml",
    "save": true
  },
  "jsdoc": {
    "dest": "./doc"
  },
  "syntaxWhitelist": {
    "FunctionDeclaration": {
      "attributes": ["id", "params"],
      "code": ["body"]
    }
  }
}
```

### YAML Templates

YAML template file names should be "slugified" with a `.tpl` extention. Example:

The Parser API type "FunctionDeclaration" should have a corresponding template `function-eclaration.tpl`. At the moment templates are populated using Lodash (Underscore) templating. Because YAML is whitespace sensitive you may have to carefully watch where you place inline script 

Example:

`function-declaration.tpl` referenced in the `.jsdoccerrc` config file above will search for this template in the `yaml/templates` dir specified in the config file above. Note the indentation of the loop to populate the template with `param` values.

```
<%- id %>
  description: | <% params.forEach(function(param) {%>
    @param {type} <%= param %> - <param description> <%}); %>
  
  examples:
    -
      name: Function Body
      example: |
        ```js
        <%- body %>
        ```
```

Here is a sample of the yaml produced:

```
unbindFromStrings
  description: | 
    @param {type} target - <param description> 
    @param {type} entity - <param description> 
    @param {type} evt - <param description> 
    @param {type} methods - <param description> 
  
  examples:
    -
      name: Function Body
      example: |
        ```js
        {
    var methodNames = methods.split(/\s+/);
    _.each(methodNames, function (methodName) {
        var method = target[methodName];
        target.stopListening(entity, evt, method);
    });
}
        ```
```
### Batch Jobs

Place all of your js files in the source js dir specified in your `.jsdoccerrc` config file wich defaults to `./input/js`. From the command line type `node document.js`. Documented files will be saved in the `output` directory.

### To Do
* --template ymal from target JSON parse results for jsdoc.--
* convert to grunt task.
* --consult external config file.--