#### Goals:
- [x] generate stubbed YAML documentation template
- [x] build document webpages from JSDoc
- [ ] lint existing documents

**There have been some major changes between 1.0, 1.1, 1.2 and 1.3. This is a pure Node.js tool. If you are looking for a Grunt task you can find it at [grunt-jsdoccer](https://github.com/ChetHarrison/grunt-jsdoccer).

A collaboration with [@jasonLaster](https://github.com/jasonLaster)

# JsDoccer 

(OK a tool that documents your code should have some **REALLY** good docs right?. But I'm working on getting that live so, imagine that icon with the man shoveling stuff)

 A collection of Node.js tasks to:

* Auto-document your ECMAScript (Java Script) using [Esprima](http://esprima.org/) It converts your code into YAML templates that allows you to fill in stubbed examples and descriptions using [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) sintax. 
* Convert the those YAML files to HTML docs.
* Lint those docs to keep them up to date.


### Basic Usage

Setup

```
$ npm install jsdoccer
```

1) Create stubbed YAML document templates.

```
$ node node_modules/jsdoccer/stub [<path/to/files/you/want/to/doc/globaway/**/*.js>]
```

This will generate `ast`, `json-pre`, and `yaml-stubbed` files in the `intermediate` directory under the the `dest` argument in your `.jsdoccerrc` config file. At the moment you will want to copy your YAML stubs to a different directory __before you add examples and descriptions__ so you don't overwrite your files if you rerun the stub task. You will want to place them in the directory configured in the `.jsdoccerrc` file under the `documentedYaml` arg. The default is `yaml-documented`. *I am working on removing this step and auto augmenting existing documentation in a non-destructive fashion.*

2) Generate documents.

```
$ node node_modules/jsdoccer/doc [<path/to/yaml/you/want/to/doc>]
```

Generated documents can be found in the `doccer/docs` folder (or where ever you configured the destination). *At the moment the default styles are messed up so you will get naked HTML.*

### Configuration

The `./jsdoccerrc` file contains configuration for the tool. If no files are provided on the command line the tool will glob the files listed in the `js` directory for target files. In the generate documentation phasethe tool will look for your augmented YAML in the globs configured under the `documentedYaml` argument. All intermediate files are saved under the `dest` path. These are useful for debug.

Syntax targets are specific types of code you would like to document like *functions* or *properties*. JsDoccer comes with the following targets that you include or ignore based on a boolean under the `targets/defaut`. They are

* name
* class
* constructors
* events
* functions
* properties

### Extention

JsDoccer uses a collection of templates and functions designed to find syntax targets and render them. You can use what ever templating library you are comfortable with, however with nested templates I recomend [Handelbars](http://handlebarsjs.com/) for it's support of partials.

Each syntax target requires a YAML template for creating the document stubs and an HTML template for creating the documentation as well as functions to render them. You will also need to provide a matcher function that can parse an AST node looking for the target. You may optionally provide a linter function if you would like to use the linter. All of the default target code can be found under `scr/syntax-targets` for examples. This is also where the documentation website index template `docs-index.hbs` lives.

Add custom targets to your `.jsdoccerrc` file under `targets/custom` with a true value. __Make sure the file name matches target name.__

There are 2 ways to extend the doccer with custom targets. 1) Add arguments and a path to your `.jsdoccerrc` file under `targets/custom` and `targets/customTargetsPath`. To choose this route you will need to set up a folder with an identical name to the target argument in your `.jsdoccerrc` file. in that folder you will need to provide the following 6 files and they must be named as follows

* `linter.js` a lint function that will be passed old and new verison you your YAML
* `matcher.js` a matching fuction that will search an AST and return the pertinate information about that target.
* `templateYaml.js` a function that will populate a template with the YAML stub of your syntax target.
* `templateHtml.js` a function that will populate a template with the HTML documentation of your syntax target.


2) Add the functions to the `jsdoccer` object.

```js
jsdoccer.addSyntaxTargets({
    target: name,
    linter: aLinterFunction,
    matcher: aMatcherFunction,
    yamlTemplater: aYamlTemplaterFunction,
    htmlTemplater: aHtmlTemplaterFunction
});
```

You can pass several targets in an array as well.



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

#### Target Syntax Matchers

In order to find syntax targets you can create a custom document "type" by adding a type attribute and associated matching function to the `jsdoccer/syntax-matchers.js` hash for example:


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

The script will recursively walk the ASTs of each file passing every node to each match function. Each match function should return `false` or a valid JSON object containing all of the data the associated YAML template requires. While you can certainly return the raw AST node, I recommend you filter and organize your JSON here rather than in the template.

To find out the AST conditions that match the code you would like to document compare your code with the ASTs saved in the `ast` directory. Then you will have a predictable AST JSON structure to query in an associated template for each document type.

#### Parse JSON like a champ

Map/Reduce is your friend when you need to pull deeply nested targets out of a large amount of JSON. I use a modified Array with the 5 magic RX methods attached. I highly recommend you spend a little time with [this excellent tutorial](http://reactive-extensions.github.io/learnrx/) from Jafar Husain of Netflix **Note: Do it in Chrome. It doesn't work in Firefox.** Then you will be able to inspect the generated AST files in the `ast` directory and write your own custom matchers in the `syntax-matchers.js` file.

Example:

`functions.tpl` referenced in the `syntax-matchers.js` hash above will search for this template in the `jsdoccer/templates/yaml` dir specified in the `.jsdoccerrc` file above. **Note the indentation of the loop to populate the template with `param` values.**

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

