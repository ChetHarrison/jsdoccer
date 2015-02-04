'use strict';

var path = require('path'),
        expect = require('chai').expect,
  fs = require('fs'),
        root = '../../../../',
        yamlDocumentedToJsonApi = require(root + 'src/parsers/yaml-documented-to-json-api.js'),
        expectedJson = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/json-api/application.json'), {encoding: 'utf8'}),
        yamlFile = fs.readFileSync(path.resolve(__dirname, '../../../mock-files/yaml-documented/application.yaml'), {encoding: 'utf8'});

describe('yaml-documented-to-json-api', function () {

        it('should return expected API JSON', function () {
                var generatedJson;

                generatedJson = yamlDocumentedToJsonApi.parse(yamlFile);
                expect(generatedJson).to.eql(expectedJson);
        });
});
