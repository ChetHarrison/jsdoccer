### This is a work in progress and not ready for prime time.
#### Because:
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/ChetHarrison/jsdoccer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
* parse documented YAML to JSDoc
* convert to grunt task.

# JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/) and [ESCodeGen](https://github.com/Constellation/escodegen). It converts your code into YAML templates that (will be) converted to JSDocs. The YAML stage allows you to fill in stubbed examples and other details that cannot be generated from the provided Esprima code meta data.

### Basic Usage

Setup

```
$ git clone git@github.com:ChetHarrison/jsdoccer.git
$ cd jsdoccer
```


This tool will provide 2 primarey functions. 

1) create stubbed YAML document templates

```
$ npm start
```

2) lint existing documents **(this is not working right now)**

```
$ node lint-docs.js
```

**Note: JSDoccer comes with some default syntax to document your JS. In order to configure it to specific syntax you will need to adapt the `.jsdoccerrc` file add target syntax AST tests to the `syntax-matchers.js` file and add any custom YAML templates to the `templates` directory.**

### What You Need To Know About ASTs

An AST or Abstract Syntax Tree is a typed representation of valid code. Esprima will parse valid ECMAScript and generate an AST. ESCodeGen provides an "inverse" operation that will generate valid ECMAScript from Esprima ASTs.

Esprima will parse this Javascript:

```
var answer = 42;
```

and generate this AST:

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

In order to find syntax targets you can create a custom document "type" by adding a type attribute and associated matching function to the `syntax-matchers.js` hash for example:


```
module.exports = {
    functions: function(ast) {
      var json = [ast].
        filter(function (ast) {
          return ast.type === 'Property' &&
            ast.value.type === 'FunctionExpression' &&
            ast.key.type === 'Identifier' &&
            ast.key.name !== 'constructor'; // filter named constructors
        }).
        map(function(property) {
          return {
            name: property.key.name,
            tags: [property.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
              property.value.params.
              filter(function (param) {
                return param.type === 'Identifier';
              }).
              map(function (param) {
                return '@param {<type>} ' + param.name + ' - ';
              }),
              _hasReturn(property.value.body.body) ? ['@returns {<type>} -'] : []
            ].mergeAll()
          };
        });
        
      if (json.length > 0) {
        return json.pop();
      }
      
      return false;
    }
  };
```
**Note**: I am using map/reduce to produce exactly the JSON I need here. You could just as easily use regex or even string matching to identify a target case and return the current unfiltered AST node containing all the data your template requires.

The script will recursively walk the ASTs of each file passing every node to each match function. Each match function should return `false` or a valid JSON object containing all of the data the associated YAML template requires. While you can certainly return the raw AST node, I recomend you filter and organize your JSON here rather than in the template.

To find out the AST conditions that match the code you would like to document compare your code with the ASTs saved in the `ast` directory. Then you will have a predictable AST JSON structure to query in an associated template for each document type.

#### Parse JSON like a champ

Map/Reduce is your friend when you need to pull deeply nested targets out of a large amount of JSON. I use a modified Array with the 5 magic RX methods attached. I highly recomend you spend a little time with [this excellent tutorial](http://reactive-extensions.github.io/learnrx/) from Jafar Husain of Netflix **Note: Do it in Chrome. It doesn't work in Firefox.** Then you will be able to inspect the generated AST files in the `ast` directory and write your own custom matchers in the `syntax-matchers.js` file.

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
  "json": {
    "dest": "./json/"
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
    "src": "./syntax-matchers.js"
  },
  "fileFilters": [".DS_Store"]
}
```

**js**: The js files you wish to document.

**ast**: Where to save the generated ASTs.

**json**: Where to save the JSON returned from your matching function.

**yaml**: Where to save the documentation YAML files.

**jsdoc**: Where to save the generated JSDoc files.

**syntaxToDocument**: Where to find your syntax target matcher functions.

**fileFilters**: Files listed here will be ignored by the parser.

#### YAML Templates

YAML template file names should be "slugified" with a `.tpl` extention. Example:

The syntax target type "functions" should have a corresponding template `functions.tpl`. At the moment templates are populated using Lodash (Underscore) templating. Because YAML is whitespace sensitive you may have to carefully watch where you place inline script.

Example:

`functions.tpl` referenced in the `syntax-matchers.js` hash above will search for this template in the `yaml/templates` dir specified in the `.jsdoccerrc` file above. **Note the indentation of the loop to populate the template with `param` values.**

```
<%- id %>
  description: | <% params.forEach(function(param) {%>
    @param {type} <%= param %> - <param description> <%}); %>
  
  examples:
    -
      name: Function Body
      example: |
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

At the moment that is as far as I have gotten. You would then augment the stubbed YAML with examples and descriptions. The final step, comming soon, is to generate JSDoc files from the YAML ... 