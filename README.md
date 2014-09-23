###This is a work in progress and not ready for prime time.

###JSDoccer

A Node.js tool to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/).

###Basic Usage

From the command line

```
$ git clone git@github.com:ChetHarrison/jsdoccer.git
$ cd jsdoccer
$ node document.js <file path/name>
```

So for example you could try

`node document.js document.js`

and you would get (at the moment)

```
Parsing: document.js
{
    "type": "Program",
    "body": [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "Literal",
                "value": "use strict",
                "raw": "'use strict'"
            }
        },
        {
            "type": "IfStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": "<",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "process"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "argv"
                        }
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "length"
                    }
                },
                "right": {
                    "type": "Literal",
                    "value": 3,
                    "raw": "3"
                }
            },
            "consequent": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "console"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "log"
                                }
                            },
                            "arguments": [
                                {
                                    "type": "BinaryExpression",
                                    "operator": "+",
                                    "left": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Literal",
                                            "value": "Usage: node ",
                                            "raw": "'Usage: node '"
                                        },
                                        "right": {
                                            "type": "MemberExpression",
                                            "computed": true,
                                            "object": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "process"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "argv"
                                                }
                                            },
                                            "property": {
                                                "type": "Literal",
                                                "value": 1,
                                                "raw": "1"
                                            }
                                        }
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": " FILENAME",
                                        "raw": "' FILENAME'"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "process"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "exit"
                                }
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "value": 1,
                                    "raw": "1"
                                }
                            ]
                        }
                    }
                ]
            },
            "alternate": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "fs"
                    },
                    "init": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "require"
                        },
                        "arguments": [
                            {
                                "type": "Literal",
                                "value": "fs",
                                "raw": "'fs'"
                            }
                        ]
                    }
                },
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "filename"
                    },
                    "init": {
                        "type": "MemberExpression",
                        "computed": true,
                        "object": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "process"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "argv"
                            }
                        },
                        "property": {
                            "type": "Literal",
                            "value": 2,
                            "raw": "2"
                        }
                    }
                },
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "esprima"
                    },
                    "init": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "require"
                        },
                        "arguments": [
                            {
                                "type": "Literal",
                                "value": "esprima",
                                "raw": "'esprima'"
                            }
                        ]
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "fs"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "readFile"
                    }
                },
                "arguments": [
                    {
                        "type": "Identifier",
                        "name": "filename"
                    },
                    {
                        "type": "Literal",
                        "value": "utf8",
                        "raw": "'utf8'"
                    },
                    {
                        "type": "FunctionExpression",
                        "id": null,
                        "params": [
                            {
                                "type": "Identifier",
                                "name": "err"
                            },
                            {
                                "type": "Identifier",
                                "name": "code"
                            }
                        ],
                        "defaults": [],
                        "body": {
                            "type": "BlockStatement",
                            "body": [
                                {
                                    "type": "IfStatement",
                                    "test": {
                                        "type": "Identifier",
                                        "name": "err"
                                    },
                                    "consequent": {
                                        "type": "ThrowStatement",
                                        "argument": {
                                            "type": "Identifier",
                                            "name": "err"
                                        }
                                    },
                                    "alternate": null
                                },
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "Identifier",
                                                "name": "console"
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "log"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "BinaryExpression",
                                                "operator": "+",
                                                "left": {
                                                    "type": "Literal",
                                                    "value": "Parsing: ",
                                                    "raw": "'Parsing: '"
                                                },
                                                "right": {
                                                    "type": "Identifier",
                                                    "name": "filename"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "Identifier",
                                                "name": "console"
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "log"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "CallExpression",
                                                "callee": {
                                                    "type": "MemberExpression",
                                                    "computed": false,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "JSON"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "stringify"
                                                    }
                                                },
                                                "arguments": [
                                                    {
                                                        "type": "CallExpression",
                                                        "callee": {
                                                            "type": "MemberExpression",
                                                            "computed": false,
                                                            "object": {
                                                                "type": "Identifier",
                                                                "name": "esprima"
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "parse"
                                                            }
                                                        },
                                                        "arguments": [
                                                            {
                                                                "type": "Identifier",
                                                                "name": "code"
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        "type": "Literal",
                                                        "value": null,
                                                        "raw": "null"
                                                    },
                                                    {
                                                        "type": "Literal",
                                                        "value": 4,
                                                        "raw": "4"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        "rest": null,
                        "generator": false,
                        "expression": false
                    }
                ]
            }
        }
    ]
}
```