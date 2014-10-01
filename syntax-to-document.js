module.exports = {
		methods: function(ast) {
			return ast.type === 'Property' &&
				ast.value.type === 'FunctionExpression';
		},

		functions: function(ast) {
			return ast.type === 'FunctionDeclaration';
		}
	};