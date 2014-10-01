<%- ast.id %>
  description: | <% ast.params.forEach(function(param) {%>
    @param {type} <%= param %> - <param description> <%}); %>
  
  examples:
    -
      name: Function Body
      example: |
        ```js
        <%= code.body %>
        ```