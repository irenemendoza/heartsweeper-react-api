/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		const corsHeaders = {
			"Access-Control-Allow-Origin": "https://heartsweeper.irenemendoza.dev",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		if (url.pathname === "/api/scores" && request.method === "POST") {
			return await guardarPuntuacion(request, env, corsHeaders);
		}

		if (url.pathname === "/api/scores" && request.method === "GET") {
			return await obtenerTopPuntuaciones(url, env, corsHeaders);
		}		

		return new Response(
			JSON.stringify({ error: "Ruta no encontrada" }),
			{ status: 404,
				headers: { ...corsHeaders,
					"Content-Type": "application/json"
				}
			}
		);
	},
}

	async function guardarPuntuacion(request, env, corsHeaders){
		try {
			const { 
				dimension,
				difficulty,
				player_name,
				time_ms
			} = await request.json()

			if (!dimension || !difficulty || !player_name || !time_ms){
				return new Response(
					JSON.stringify({ error: "Faltan campos obligatorios" }),
					{ status: 400,
						headers: { ...corsHeaders, "Content-Type": "application/json"}
					}
				);
			}
			await env.DB.prepare(
				`INSERT INTO scores (dimension, difficulty, player_name, time_ms) VALUES (?, ?, ?, ?)`
			)
			.bind(dimension, difficulty, player_name, time_ms)
			.run();

			return new Response(
				JSON.stringify({ success: true }),
				{ status: 201,
					headers: {...corsHeaders, "Content-Type": "application/json"}
				}
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: error.message }),
				{ status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json"}
				}
			);
		};
	};

	async function obtenerTopPuntuaciones(url, env, corsHeaders){
		try{
			const dimension = url.searchParams.get("dimension");
			const difficulty = url.searchParams.get("difficulty");

			if (!dimension || !difficulty){
				return new Response(
					JSON.stringify({ error: "Faltan parámetros dimensión o dificultad" }),
					{ status: 400,
						headers: { ...corsHeaders, "Content-Type": "application/json"}
					}
				);
			}

			const { results } = await env.DB.prepare(
				`SELECT player_name, time_ms, created_at 
				FROM scores 
				WHERE dimension = ? AND difficulty = ?
				ORDER BY time_ms ASC
				LIMIT 5`
			)
			.bind(dimension, difficulty)
			.all();

			return new Response(
				JSON.stringify(results),
				{ status: 200,
					headers: {...corsHeaders, "Content-Type": "application/json"}
				}
			);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: error.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json"}}
			);
		} 
	};		


