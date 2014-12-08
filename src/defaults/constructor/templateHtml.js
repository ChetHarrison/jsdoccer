          {{#if constructor}}{{#with constructor}}
            <div class="function_block">
              {{#with description}}
                <div class="function_signature">
                  <a href="#constructor"><h3>&#x25cf; constructor({{paramStr}})</h3></a>
                </div>

                {{{description.full}}}

                {{#if params}}
                  <div class="params">
                    <h4>Params</h4>
                    {{#each params}}
                      <div class="param">
                        <span class="param-name">{{name}}</span>
                        <span class="param-types">{{#if typeStr}}({{typeStr}}){{/if}}</span>
                        <span class="param-description">{{#if description}} &nbsp; {{description}} {{/if}}</span>
                      </div>
                    {{/each}}
                  </div>
                {{/if}}
              {{/with}}
            </div>
          {{/with}}{{/if}}
