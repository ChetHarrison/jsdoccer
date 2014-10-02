<%- key.name %>
  description: | <% value.params.forEach(function(param) {%>
    @param {type} <%= param.name %> - <param description> <%}); %>
  
  examples:
    -
      name:
      example: |
      