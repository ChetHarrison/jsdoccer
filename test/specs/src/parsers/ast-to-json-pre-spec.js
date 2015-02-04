'use strict';

var path = require('path'),
  expect = require('chai').expect,
  fs = require('fs'),
        root = '../../../../',
        match = root + 'src/syntax-targets/',
        astToDocJson = require(root + 'src/parsers/ast-to-json-pre.js'),
        expectedJSON = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/json-pre/application.json'), {encoding: 'utf8'}),
        matchers = {},
        astFile = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/ast/application.json'), {encoding: 'utf8'});

matchers['class'] = require(match + 'class/matcher.js'),
matchers['constructor']  = require(match + 'constructor/matcher.js'),
matchers['events']  = require(match + 'events/matcher.js'),
matchers['functions']  = require(match + 'functions/matcher.js'),
matchers['properties']  = require(match + 'properties/matcher.js');


describe('ast-to-json-pre', function () {

        it('should return expected JSON', function () {
                astToDocJson.init({ matchers: matchers })
                var generatedAst = astToDocJson.parse(astFile);
                expect(generatedAst).to.eql(expectedJSON);
        });
});
