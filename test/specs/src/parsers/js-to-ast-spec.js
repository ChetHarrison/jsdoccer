'use strict';

var path = require('path'),
        expect = require('chai').expect,
  fs = require('fs'),
        jsToAst = require('../../../../src/parsers/js-to-ast.js');

describe('parser js-to-ast', function () {
        var generatedAst;

        it('should return expected AST', function () {
                var desiredAST = JSON.stringify({
                                'type': 'Program',
                                'body': [
                                        {
                                                'type': 'VariableDeclaration',
                                                'declarations': [
                                                        {
                                                                'type': 'VariableDeclarator',
                                                                'id': {
                                                                        'type': 'Identifier',
                                                                        'name': 'answer'
                                                                },
                                                                'init': {
                                                                        'type': 'Literal',
                                                                        'value': 42,
                                                                        'raw': '42'
                                                                }
                                        }
                                      ],
                                                'kind': 'var'
                                    }
                                  ]
                        }, null, 2);

                generatedAst = jsToAst.parse('var answer = 42;');

                expect(generatedAst).to.eql(desiredAST);
        });
});

