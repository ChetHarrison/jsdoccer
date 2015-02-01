'use strict';

var path = require('path'),
        expect = require('chai').expect,
  fs = require('fs'),
        root = '../../../../',
        htmlTemplaters = {},
        match = root + 'src/syntax-targets/',
        jsonApiToDocs = require(root + 'src/parsers/json-api-to-docs.js'),
        expectedHtml = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/docs/application.html'), {encoding: 'utf8'}),
        jsonFile = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/json-api/application.json'), {encoding: 'utf8'});

htmlTemplaters['class'] = require(match + 'class/templateHtml.js'),
htmlTemplaters['constructor']  = require(match + 'constructor/templateHtml.js'),
htmlTemplaters['events']  = require(match + 'events/templateHtml.js'),
htmlTemplaters['functions']  = require(match + 'functions/templateHtml.js'),
htmlTemplaters['properties']  = require(match + 'properties/templateHtml.js');

describe('json-api-to-docs', function () {

        it('should return expected doc HTML', function () {
                var generatedHtml;

                jsonApiToDocs.init({
                        htmlTemplaters: htmlTemplaters,
                        docPageTplPath: path.resolve(__dirname, root, 'src/syntax-targets/docs-index.hbs'),
                        projectName: 'custom name'
                });

                generatedHtml = jsonApiToDocs.parse(jsonFile);
    expect(generatedHtml).to.eql(expectedHtml);
        });
});

