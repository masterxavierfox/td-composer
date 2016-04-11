<?php
/**
 * Created by ra.
 * Date: 3/4/2016
 */

add_action( 'rest_api_init', 'tdc_register_api_routes');
function tdc_register_api_routes() {
	$namespace = 'td-composer';


	register_rest_route($namespace, '/do_job/', array(
		'methods'  => 'POST',
		'callback' => array ('tdc_ajax', 'on_ajax_render_shortcode'),
	));


}



class tdc_ajax {
	static function on_ajax_render_shortcode (WP_REST_Request $request ) {


		// get the $_POST parameters only
		$parameters = $request->get_body_params();



		td_util::vc_set_column_number($request->get_param('columns'));


		/*
			we need to call the shortcode with output buffering because our style generator from our blocks just echoes it's generated
			style. No bueno :(
		*/
		ob_start();
		echo do_shortcode(stripslashes($request->get_param('shortcode')));
		$reply_html = ob_get_clean();




		$parameters['replyHtml'] = $reply_html;



		//sleep(rand(0, 1));


//		if (rand(0,1)) {
//			echo 'fuckshit';
//			die;
//		}

		//print_r($request);
		//die;

		die(json_encode($parameters));
	}
}