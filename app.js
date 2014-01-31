var express = require( "express" );
var utils = require( "express/node_modules/connect" ).utils;

var app = express();
app.set( "view engine", "hbs" );

// Express merges all data before invoking the view
// so we need to proxy app.render()
app.render = (function( render ) {
	return function( view, options, callback ) {
		if ( typeof options === "function" ) {
			callback = options;
			options = {};
		}

		// Mix request.locals (options._locals) with app.locals (this.locals)
		var locals = options._locals || {};
		utils.merge( locals, this.locals );

		// Store the locals on options, replacing what was request.locals
		options._locals = locals;

		// Store the data again, so that we can differentiate this data from
		// the data passed to response.data() when we're inside the view
		options._locals._data = locals;

		return render.call( this, view, options, callback );
	};
})( app.render );

app.locals.app = { title: "hbs + lexical data" };
app.use(function( request, response, next ) {
	response.locals.user = { name: "scott" };
	next();
});

app.get( "/", function( request, response ) {
	response.render( "page", {
		items: [
			{ label: "first" },
			{ label: "second" },
			{ label: "third" }
		]
	});
});

app.listen( 3000 );
