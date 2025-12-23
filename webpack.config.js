var path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const project_name = "kinotube";

module.exports = function(env) {
  var config = {entry: {}};

  config.entry[project_name] = [
	'./src/js/storage.js',
	'./src/js/index.js',
	'./src/js/enum.js',
	'./src/js/ui/ui.js',
	'./src/js/ui/settings.js',
	'./src/js/ui/layout.js',
	'./src/js/ui/polls.js',
	'./src/js/ui/layout-settings.js',
	'./src/js/classes/EmoteListOverride.js',
	'./src/js/classes/ChatCommand.js',
	'./src/js/classes/ClientCommand.js',
	'./src/js/classes/CustomEmoteList.js',
	'./src/js/classes/FXEmoteList.js',
	'./src/js/ui/themes.js',
	'./src/js/chat/commands.js',
	'./src/js/chat/clicommands.js',
	'./src/js/chat/emote_fx.js',
	'./src/js/events.js',
	'./src/js/overrides.js',
	'./src/js/chat/emote_limiter.js',
	'./src/js/keybinds.js',
	'./src/js/ui/emotefavs.js',
	'./src/js/video/autoembed.js',
	'./src/js/video/audiocontrol.js',
	'./src/js/ui/emotelist_override.js',
	'./src/js/ui/motd_editor.js',
	'./src/js/expose.js',
	'./src/js/addons/gif_search/addon.js',
	'./src/js/addons/nnd/addon.js',
	'./src/js/addons/checkem/addon.js',
	'./src/js/addons/poll_bet/addon.js',
	'./src/js/addons/jscsseditors/addon.js',
  ];
  Object.assign(config, {

	mode: "production",

	devtool: false,

    output: {
      path: path.resolve(__dirname, './build'),
      filename: '[name].js',
    },

    module: {

		rules: [
			{
				test: /\.css$/i,
				resourceQuery: /raw/,
				use: [
					{
						loader: "css-loader",
						options: {
							sourceMap: false,
							exportType:'string'
						}
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								sourceMap: false,
								map: false,
								plugins: [
									"cssnano"
								],
							},
						},
					},
				],

			},
			{
				test: /\.css$/i,
				resourceQuery: { not: [/raw/] },
				use: ["style-loader", {
						loader: "css-loader",
						options: {
							sourceMap: false,
						}
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								sourceMap: false,
								map: false,
								plugins: [
									"cssnano"
								],
							},
						},
					},]
			},
			{
				test: /\.scss$/i,
				resourceQuery: { not: [/raw/] },
				use: ["style-loader", {
						loader: "css-loader",
						options: {
							sourceMap: false,
						}
					},
					"sass-loader"]
			},
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: true
						}
					}
				]
			}
		]
    },

    resolve: {
      modules: [path.resolve('./src'), path.resolve('node_modules')],
      extensions: ['.js', '.jsx']
    },

    externals: {},

    plugins: [],

    optimization: {
        minimize: true,
        minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					mangle: true,
					format: {
						comments: false
					}
				},
				extractComments: false
			})
		],
    },

    stats: {
		colors: true,
		orphanModules: true
    }

  });
  //console.log(config.output.path);
  return config;
};