<%- key.name %>:
  description: | <% value.params.forEach(function(param) {%>
    @param {type} <%= param.name %> - <param description> <%}); %>
    @returns {type} - <returns description>
  
  examples:
    -
      name:
      example: |
      