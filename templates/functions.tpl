<%- id.name %>:
  description: | <% params.forEach(function(param) {%>
    @param {type} <%= param.name %> - <param description> <%}); %>
  
  examples:
    -
      name: 
      example: |
      