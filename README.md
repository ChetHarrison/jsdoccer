### This is a work in progress and not ready for prime time.

### JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/) and [ESCodeGen](https://github.com/Constellation/escodegen). It converts your code into YAML templates that (will be) converted to JSDocs. The YAML stage allows you to fill in stubbed examples and other details that cannot be generated from the provided Esprima code meta data.

### Basic Usage

From the command line

```
$ git clone git@github.com:ChetHarrison/jsdoccer.git
$ cd jsdoccer
$ node document.js
```

**Note: JSDoccer comes with some default syntax to document your JS. In order to configure it to specific syntax you will need to adapt the `.jsdoccerrc` file add target syntax AST tests to the `syntax-to-document.js` file and add any custom YAML templates to the `templates` directory.** *whoo that's a lot o config, but hopefully worth it!*

### What You Need To Know About ASTs

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

AST types are defined by the [Spider Monkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions). 

#### Configuring Custom Documentation

In order to find syntax targets you can create a custom document "type" by adding a type attribute and associated matching function to the `syntax-to-document.js` hash for example:


```
module.exports = {
    methods: function(ast) {
      return ast.type === 'Property' &&
        ast.value.type === 'FunctionExpression';
    },

    functions: function(ast) {
      return ast.type === 'FunctionDeclaration';
    }
  };
```

This will parse the ASTs of each files for nodes that match these conditions. To find out the AST conditions that match the code you would like to document compare your code with the ASTs saved in the `ast` directory. Then you will have a predictable AST JSON structure to query in an associated template for each document type.

#### .jsdoccerrc

This file configures the source and destination paths.

```
{
  "js": {
    "src": "./js/"
  },
  "ast": {
    "dest": "./ast/",
    "save": true
  },
  "yaml": {
    "templates": "./templates/",
    "dest": "./yaml/",
    "save": true
  },
  "jsdoc": {
    "dest": "./jsdoc/"
  },
  "syntaxToDocument": {
    "src": "./syntax-to-document.js"
  },
  "fileFilters": [".DS_Store"]
}
```

#### YAML Templates

YAML template file names should be "slugified" with a `.tpl` extention. Example:

The document type "functions" should have a corresponding template `functions.tpl`. At the moment templates are populated using Lodash (Underscore) templating. Because YAML is whitespace sensitive you may have to carefully watch where you place inline script 

Example:

`functions.tpl` referenced in the `syntax-to-document.js` hash above will search for this template in the `yaml/templates` dir specified in the `.jsdoccerrc` file above. **Note the indentation of the loop to populate the template with `param` values.**

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
      name: 
      example: |
```

### To Do
* convert to grunt task.