(function(){

	'use strict';

	// Variablews 

	let audioContext = null;
	let analyser = null;
	let microphone = null;
	let javascriptNode = null;
	let average = null;
	let isPaused =  true;

	// Bird Position
	let bX = 10;
	let bY = 50;

	let currentPos = bY;


	// Gravity
	let gravity = 1.5 ;

	// Score
	let score = 0;


	// Audio detect
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if(navigator.getUserMedia) {
		navigator.getUserMedia({
			audio: true
		}, 
		  function(stream) {
		      audioContext = new AudioContext();
		      analyser = audioContext.createAnalyser();
		      microphone = audioContext.createMediaStreamSource(stream);
		      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

		      analyser.smoothingTimeConstant = 0.1;
		      analyser.fftSize = 2048;

		      microphone.connect(analyser);
		      analyser.connect(javascriptNode);
		      javascriptNode.connect(audioContext.destination);

		      javascriptNode.onaudioprocess = function() {
		          let array = new Uint8Array(analyser.frequencyBinCount);
		          analyser.getByteFrequencyData(array);
		          let values = 0;

		          let length = array.length;
		          for (let i = 0; i < length; i++) {
		            values += (array[i]);
		          }
		          // console.log(values);
		          average = values / length;

		          if (Math.round(average) >= 30) {
		          		console.log('Up!' + average);
		         		moveUp();
		          }

		        };
		    },

		function(err){
			console.log(err);
		});

	} else {
	  console.log("getUserMedia not supported");
	}


	//////////
	// CANVAS 
	//////////

	window.addEventListener('load', draw, true);



	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext("2d");

	// console.log('d ' + canvas.width);


	const bird = new Image();
	const bg = new Image();
	const fg = new Image();
	const pipeTop = new Image();
	const pipeBottom = new Image();
	const start = new Image();
	const controls = new Image();


	const gap = 100;
	let fgpos = 0;


	 bird.src = 'images/plane.png';
	 bg.src = 'images/flappybg.png';
	 pipeTop.src = 'images/pT.png';
	 pipeBottom.src = 'images/pB.png';
	 fg.src = 'images/fg.png';
	 start.src = 'images/start.png';
	 controls.src = 'images/controls.png';




	// Controls
	document.addEventListener('keydown' , (e) => { if(e.keyCode === 32){moveUp(25);}});
	document.addEventListener('keydown' , (e) => { if(e.keyCode === 13){run();}});
	document.addEventListener('click' , run);


	function startGame(){
		ctx.drawImage(start, canvas.width/2-start.width/2, 50);
		ctx.drawImage(controls, canvas.width/2-start.width/2, canvas.height - controls.height - fg.height);
	}

	function moveUp(up = 20) {
		console.log(up);
		bY -= up;
	}  

	function movingBg() {
		fgpos--;
		if(fgpos <= (-canvas.width ) ){	fgpos = 0;}

		ctx.drawImage(fg, fgpos, canvas.height - fg.height, canvas.width, fg.height );
		ctx.drawImage(fg, fgpos + canvas.width  , canvas.height - fg.height, canvas.width, fg.height );

	}


	// Pipe Coordinates

	let pipe = [];

	pipe[0] = {
		x: canvas.width,
		y: -canvas.height/4,
	};

	function run(){
		isPaused = !isPaused;
		draw();
		if(isPaused) {
			currentPos = bY;
		} else {
			bY = currentPos;
		}
	}

	function draw() {

		ctx.drawImage(bg, 0 ,0);

		for(let i = 0; i < pipe.length; i++) {
	
			ctx.drawImage(pipeTop, pipe[i].x, pipe[i].y);
			ctx.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeTop.height + gap);


			pipe[i].x--;			
			if( pipe[i].x === (canvas.width - 200) ){
				pipe.push({
					x: canvas.width,
					y: Math.floor(Math.random() * pipeTop.height) - pipeTop.height,
				})
			}


			// // Colisions

			if( bX + bird.width >= pipe[i].x && 
				bX <= pipe[i].x + pipeTop.width && 
				(bY <= pipe[i].y + pipeTop.height || bY + bird.height >= pipe[i].y + pipeTop.height + gap) || 
				bY + bird.height >= canvas.height - fg.height) {

			
				// console.log('BUM !');
				location.reload();
			} 

			if (pipe[i].x == 5) {
				score++;
			}

		} 

		movingBg();

		ctx.drawImage(bird, bX, bY);

		//grav
		bY += gravity;

		ctx.fillStyle = '#000';
		ctx.font = '20px Verdana';
		ctx.fillText('Score : ' + score, 10 , canvas.height - 20);

		ctx.fillStyle = '#000';
		ctx.font = '20px Verdana';
		ctx.fillText('Vol level: '  + Math.round(average), canvas.width - 150  , canvas.height - 20);

		if(!isPaused) {
			requestAnimationFrame(draw);
		} else {
			startGame();
		}

	}


})();
